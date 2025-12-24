const { Router } = require("express");
const appController = require('../controllers/appController');
const { loginValidation, validate, signupValidation } = require("../middewares/validation");
const { authenticateToken, roleRequired } = require("../middewares/auth");
const appRouter = Router();

//NOTE:tested with curl and postmon(single and colleciton)
//TODO:later will test it with jest/supertest 
//TODO:maybe use a tool to craete api documentation

//author auth:
appRouter.post('/api/author/signup',
    signupValidation,
    validate,
    appController.authorSignup
);
appRouter.post('/api/author/login',
    loginValidation,
    validate,
    appController.authorLogin
);
appRouter.get('/api/author/profile',
    authenticateToken,
    roleRequired('author'),
    appController.getAuthor
);
appRouter.put('/api/author/profile',
    authenticateToken,
    roleRequired('author'),
    appController.updateAuthor
);
appRouter.delete('/api/author/account',
    authenticateToken,
    roleRequired('author'),
    appController.deleteAuthor
);
//NOTE:author actions:
//create new post
appRouter.post('/api/author/posts',
    authenticateToken,
    roleRequired('author'),
    appController.createAPost
);
//get authors all blog posts
appRouter.get('/api/author/posts',
    authenticateToken,
    roleRequired('author'),
    appController.getAuthorPosts
);
//get a post
appRouter.get('/api/author/posts/:postId',
    authenticateToken,
    roleRequired('author'),
    appController.getAPost
);
//update a post
appRouter.put('/api/author/posts/:postId',
    authenticateToken,
    roleRequired('author'),
    appController.updateAPost
);
//delete a post
appRouter.delete('/api/author/posts/:postId',
    authenticateToken,
    roleRequired('author'),
    appController.deleteAPost
);

// //NOTE:user auth
appRouter.post('/api/user/signup',
    signupValidation,
    validate,
    appController.readerSignup
);
appRouter.post('/api/user/login',
    loginValidation,
    validate,
    appController.readerLogin
);
appRouter.get('/api/user/profile',
    authenticateToken,
    roleRequired('reader'),
    appController.getReader
);
appRouter.put('/api/user/profile',
    authenticateToken,
    roleRequired('reader'),
    appController.updateReader
);
appRouter.delete('/api/user/account',
    authenticateToken,
    roleRequired('reader'),
    appController.deleteReader
);
//NOTE:user(reader and author can comment) actions
//post a comment
appRouter.post('/api/comments',
    authenticateToken,
    roleRequired('reader', 'author'),
    appController.createAComment
);
//update a comment
appRouter.put('/api/comments/:commentId',
    authenticateToken,
    roleRequired('reader', 'author'),
    appController.updateAComment
);
//delete a comment
appRouter.delete('/api/comments/:commentId',
    authenticateToken,
    roleRequired('reader', 'author'),
    appController.deleteAComment
);
//NOTE:public routes
//it can be used for front page which it has like variaty of posts and maybe add tags to post model for topics like medium
appRouter.get('/api/posts/',
    appController.getPostsPublic
);
appRouter.get('/api/posts/:postId',
    appController.getAPost
);
appRouter.get('/api/authors/:username',
    appController.getAuthorPublic
);
module.exports = appRouter;
