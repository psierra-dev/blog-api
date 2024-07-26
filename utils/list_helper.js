import _ from "lodash";

export const dummy = (blogs) => {
  return 1;
};

export const totalLikes = (blogs) => {
  if (!blogs?.length) {
    return blogs[0].likes;
  }

  return blogs.map((blog) => blog.likes).reduce((a, b) => a + b, 0);
};

export const favoriteBlog = (blogs) => {
  if (!blogs?.length) {
    return blogs[0];
  }

  let blog = blogs[0];

  for (let i = 1; i < blogs.length; i++) {
    if (blog.likes < blogs[i].likes) {
      blog = blogs[i];
    }
  }

  return blog;
};

export const mostBlogs = (blogs) => {
  const groupedByAuthor = _.groupBy(blogs, "author");
  //console.log(groupedByAuthor, "grouped");
  const authorBlogCounts = _.map(groupedByAuthor, (authorBlogs, author) => {
    console.log(authorBlogs, author);
    return {
      author,
      blogs: authorBlogs.length,
    };
  });

  const maxAuthor = _.maxBy(authorBlogCounts, "blogs");
  return maxAuthor;
};

export const mostLikes = (blogs) => {
  const groupedByAuthor = _.groupBy(blogs, "author");

  const authorBlogCountLikes = _.map(
    groupedByAuthor,
    (authorBlogs, author) => ({
      author,
      likes: _.reduce(
        authorBlogs,
        (result, value) => {
          console.log(result, value, "re");
          return result + value.likes;
        },
        0
      ),
    })
  );

  const maxAuthor = _.maxBy(authorBlogCountLikes, "likes");
  console.log(maxAuthor, "maxauthot");
  return maxAuthor;
};
