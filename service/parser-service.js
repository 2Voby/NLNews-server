const bcrypt = require("bcrypt");
const uuid = require("uuid");
const ApiError = require("../exceptions/api-error");
const { default: axios } = require("axios");
const { JSDOM } = require("jsdom");
const newsModel = require("../models/news-model");
const Utils = require("./utils-service");
const sendService = require("./sender-service");

// const { axios } = require("axios");
class ParserService {
  async parseAllPages(link) {
    let resp = await axios.get(`${link}`);
    let html = resp.data;
    let dom = new JSDOM(html);
    let document = dom.window.document;
    // let pagesNumber = 1;
    let pagesNumber = 2;

    // let pagesPaginationBlock = document.querySelector(".oceanwp-pagination");
    // let pagesPaginationItems =
    //   pagesPaginationBlock.querySelectorAll(".page-numbers a");

    // let number = pagesPaginationItems[pagesPaginationItems.length - 2];
    // pagesNumber = +number.textContent;
    // for (let pageNum = 1; pageNum <= pagesNumber; pageNum++) {
    // await this.parsePage(`${link}/page/${pageNum}`, pageNum );
    await this.parsePage(`${link}`, pagesNumber);
    // }
  }

  async getPageData(link) {
    let resp = await axios.get(`${link}`);
    return resp;
  }

  async parsePage(link, pagesNum) {
    try {
      let newPosts = [];

      for (let pageNum = 1; pageNum <= pagesNum; pageNum++) {
        let resp = await this.getPageData(`${link}/page/${pageNum}`);
        let html = resp.data;

        let dom = new JSDOM(html);
        let document = dom.window.document;
        let items = document.querySelectorAll(`article[id*="post"]`);

        for (let post of items) {
          let postLink =
            post?.querySelector(".blog-entry-title a").href || null;

          let newPost = {
            id: post.id,
            title:
              post?.querySelector(".blog-entry-title a")?.textContent ||
              "Заголовок",
            author: post?.querySelector(".meta-author [itemprop='author']")
              .textContent,
            date:
              post?.querySelector(".meta-date")?.textContent?.split(":")[1] ||
              null,
            postLink: postLink,
          };

          // if (postLink) {
          //   let { postBody, images } = await this.parsePageInner(postLink);
          //   newPost.body = postBody;
          // }

          newPosts.push(newPost);
        }
      }

      let savedNews = await newsModel.find();

      let newIds = await Utils.comparePosts(savedNews, newPosts);

      if (newIds.length < 1) {
        console.log("немає нових новин");
        return;
      }

      newIds.reverse();

      for (let newPost of newIds) {
        await Utils.pause(1500);

        let { postContent, response } = await sendService.sendNewPost(newPost);
        // має бути асинхронною
        if (response.status == 200) {
          await Utils.saveNewPost(postContent);
          console.log("saved");
        } else console.log("error while sending post");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error);
      } else {
        console.log(error);
      }
    }
  }

  async parsePageInner(link) {
    let resp = await this.getPageData(`${link}`);
    let html = resp.data;

    let dom = new JSDOM(html);
    let document = dom.window.document;

    let pageContentBlock = document.querySelector(
      '.entry-content[itemprop="text"]'
    );

    let childrenArray = Array.from(pageContentBlock.children);

    let deleteBefore = true;
    childrenArray.forEach((object) => {
      if (object.classList.contains("pvc_stats")) {
        deleteBefore = false;
      }
      if (!object.classList.contains("pvc_stats") && deleteBefore == true) {
        object.remove();
      }
      if (object.classList.contains("wp-block-envira-envira-gallery")) {
        object.remove();
      }
    });

    childrenArray.forEach((item) => {
      console.log(item.textContent);
    });

    return { postBody: document, postImages: null };
  }
}

module.exports = new ParserService();
