require('@dotenvx/dotenvx').config();
const prisma = require('../db/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
//TODO:change based on the roles!
exports.authorSignup = async (req, res) => {
    const { username, password, email, name } = req.body;
    const existingUsername = await prisma.user.findUnique({
        where: { username_role: { username: username, role: "AUTHOR" } }
    });
    if (existingUsername) {
        return res.status(409).json({
            message: "User with this username already exists"
        });
    }
    const existingEmail = await prisma.user.findUnique({
        where: { email_role: { email: email, role: "AUTHOR" } }
    });
    if (existingEmail) {
        return res.status(409).json({
            message: "User with this email already exists"
        });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            email,
            name,
            role: "AUTHOR"
        }
    });
    res.status(201).json({
        message: 'author registered successfully',
        username: username
    });
}
exports.authorLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { username_role: { username: username, role: "AUTHOR" } }
        });
        if (!user) {
            return res.status(401).json({
                message: `there is no such author as ${username}`
            });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({
                message: 'wrong password'
            });
        }
        const token = jwt.sign(
            {
                id: user.id,
                role: 'author'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }

        )
        res.status(200).json({
            id: user.id,
            message: 'successfully loged in token attached',
            token: token
        })
    } catch (err) {
        res.status(500).json({
            message: 'internal server error',
        });
    }
}
exports.getAuthor = async (req, res) => {
    try {
        const author = await prisma.user.findUnique({
            where: { id: req.user.id, role: "AUTHOR" },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                posts: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
        }

        res.status(200).json({
            message: 'the author:',
            author
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching author' });
    }
};
exports.updateAuthor = async (req, res) => {
    const { username, email, newPassword, name } = req.body;
    const updateData = {};
    if (username) updateData.username = username;
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (newPassword) {
        updateData.password = await bcrypt.hash(newPassword, 10);
    }

    await prisma.author.update({
        where: { id: req.user.id },
        data: updateData
    });

    res.json({
        success: true,
        message: 'Author Profile updated successfully',
        //NOTE:flag for  redirecting to login route in frontend
        requiresRelogin: !!newPassword
    });
};
exports.deleteAuthor = async (req, res) => {
    await prisma.author.delete({
        where: { id: req.user.id },
    });

    res.json({
        success: true,
        message: 'author deleted successfully',
    });
};
exports.createAPost = async (req, res) => {
    const { postTitle, postContent } = req.body;
    const post = await prisma.post.create({
        data: {
            title: postTitle,
            content: postContent,
            authorId: req.user.id
        }
    })
    res.status(201).json({
        message: 'post created',
        id: post.id,
        post
    })
}
exports.getAuthorPosts = async (req, res) => {
    const posts = await prisma.post.findMany({
        where: {
            authorId: req.user.id
        }
    })
    res.status(200).json({
        message: 'here are the posts for this author',
        posts
    })

}
// Transform flat comments into hierarchical structure
function buildCommentTree(comments) {
    const commentMap = new Map();
    const roots = [];

    // First pass: create a map of all comments
    comments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replys: [] });
    });

    // Second pass: build the tree
    comments.forEach(comment => {
        const node = commentMap.get(comment.id);
        if (comment.parentCommentId === null) {
            roots.push(node);
        } else {
            const parent = commentMap.get(comment.parentCommentId);
            if (parent) {
                parent.replys.push(node);
            }
        }
    });

    return roots;
}
exports.getAPost = async (req, res) => {
    const postId = parseInt(req.params.postId);

    try {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: {
                comments: {
                    include: {
                        user: {
                            select: {
                                username: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                author: {
                    select: {
                        username: true
                    }
                }
            }
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const hierarchicalComments = buildCommentTree(post.comments);
        post.comments = hierarchicalComments;
        // console.dir(post.comments, { depth: 10 })


        res.json({
            message: `Post: ${post.title}`,
            post
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateAPost = async (req, res) => {
    const postId = parseInt(req.params.postId);
    const { title, content } = req.body;
    const post = await prisma.post.update({
        where: {
            id: postId
        },
        data: {
            title: title,
            content: content
        }
    })
    res.json({
        message: `here is the updated post for this title ${post.title}`,
        post
    })

}
exports.deleteAPost = async (req, res) => {
    const postId = parseInt(req.params.postId);
    const post = await prisma.post.delete({
        where: {
            id: postId
        },
    })
    res.json({
        message: `the post has been deleted successfully`
    })

}

exports.readerSignup = async (req, res) => {
    const { username, password, email, name } = req.body;
    const existingUsername = await prisma.user.findUnique({
        where: { username_role: { username: username, role: "READER" } }
    });
    if (existingUsername) {
        return res.status(409).json({
            message: "Reader with this username already exists"
        });
    }
    const existingEmail = await prisma.user.findUnique({
        where: { email_role: { email: email, role: "READER" } }
    });
    if (existingEmail) {
        return res.status(409).json({
            message: "Reader with this email already exists"
        });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            username: username,
            password: hashedPassword,
            email: email,
            name: name,
            role: "READER"

        }
    });
    res.status(201).json({
        message: 'user registered successfully'
    });
}
exports.readerLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { username_role: { username: username, role: "READER" } }
        });
        if (!user) {
            return res.status(401).json({
                message: `there is no such reader as ${username}`
            });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({
                message: 'wrong password'
            });
        }
        const token = jwt.sign(
            {
                id: user.id,
                role: 'reader'
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }

        )
        res.json({
            id: user.id,
            message: 'successfully loged in token attached',
            token: token
        })
    } catch (err) {
        res.status(500).json({
            message: 'internal server error',
        });
    }
}
exports.getReader = async (req, res) => {
    const user = await prisma.user.findFirst({
        where: {
            id: req.user.id,
            role: "READER"
        },
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
            comments: {
                orderBy: { createdAt: 'desc' }
            }
        }

    })
    const usersComments = await prisma.comment.findMany({
        where: {
            userId: req.user.id
        }
    })
    res.status(200).json({
        message: 'the user:',
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        usersComments: usersComments
    })
}
exports.updateReader = async (req, res) => {
    const { username, email, newPassword } = req.body;

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (newPassword) {
        updateData.password = await bcrypt.hash(newPassword, 10);
    }

    await prisma.user.update({
        where: { id: req.user.id },
        data: updateData
    });

    res.json({
        success: true,
        message: 'User Profile updated successfully',
        //NOTE:flag for  redirecting to login route in frontend
        requiresRelogin: !!newPassword
    });
};
exports.deleteReader = async (req, res) => {
    await prisma.user.delete({
        where: { id: req.user.id },
    });

    res.json({
        success: true,
        message: 'user deleted successfully',
    });
};
exports.createAComment = async (req, res) => {
    let { postId, parentCommentId, content } = req.body;
    postId = parseInt(postId);
    parentCommentId = parentCommentId ? parseInt(parentCommentId) : null;

    const { role, id } = req.user;

    try {
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (role === 'AUTHOR' && post.authorId !== id) {
            return res.status(403).json({
                error: 'Authors can only comment on their own posts'
            });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                userId: id,
                postId,
                parentCommentId
            }
        });

        res.status(201).json({
            message: 'Comment created successfully',
            comment
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateAComment = async (req, res) => {
    const commentId = parseInt(req.params.commentId);
    const { commentContent } = req.body;
    const comment = await prisma.comment.update({
        where: {
            id: commentId
        },
        data: {
            content: commentContent
        }
    })
    res.json({
        message: `the comment has been updated successfully`
    })
}
exports.deleteAComment = async (req, res) => {
    const commentId = parseInt(req.params.commentId);
    const comment = await prisma.comment.delete({
        where: {
            id: commentId
        },
    })
    res.json({
        message: `the comment has been deleted successfully`
    })
}
exports.getPostsPublic = async (req, res) => {
    const allPosts = await prisma.post.findMany()
    // console.dir(allPosts, { depth: 10 })
    res.json({
        message: 'all of posts:',
        allPosts: allPosts
    })
}
exports.getAuthorPublic = async (req, res) => {
    try {
        const { username } = req.params;

        const author = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                name: true,
                posts: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
        }

        res.json({
            message: `Author: ${author.name}`,
            author
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error fetching author' });
    }
};

exports.getAuthorPublic = async (req, res) => {
    try {
        const author = await prisma.user.findUnique({
            where: {
                username_role: { username: req.params.username, role: "AUTHOR" }
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                posts: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!author) {
            return res.status(404).json({ message: 'Author not found' });
        }

        res.status(200).json({
            message: 'the author:',
            author
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching author' });
    }
};
