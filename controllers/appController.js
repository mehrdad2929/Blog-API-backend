require('@dotenvx/dotenvx').config();
const prisma = require('../db/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.authorSignup = async (req, res) => {
    const { username, password, email, name } = req.body;
    const existingUsername = await prisma.author.findUnique({
        where: { username: username }
    });
    if (existingUsername) {
        return res.status(409).json({
            message: "User with this username already exists"
        });
    }
    const existingEmail = await prisma.author.findUnique({
        where: { email: email }
    });
    if (existingEmail) {
        return res.status(409).json({
            message: "User with this email already exists"
        });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.author.create({
        data: {
            username: username,
            password: hashedPassword,
            email: email,
            name: name

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
        const user = await prisma.author.findUnique({
            where: { username: username }
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
        const author = await prisma.author.findUnique({
            where: { id: req.user.id },
            include: {
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
    res.stauts(200).json({
        message: 'here are the posts for this author',
        posts
    })

}

exports.getAPost = async (req, res) => {
    const postId = parseInt(req.params.postId);
    const post = await prisma.post.findFirst({
        where: {
            id: postId
        }
    });
    res.json({
        message: `here is the post for this title ${post.title}`,
        post
    })

}
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

exports.userSignup = async (req, res) => {
    const { username, password, email, name } = req.body;
    const existingUsername = await prisma.user.findUnique({
        where: { username: username }
    });
    if (existingUsername) {
        return res.status(409).json({
            message: "User with this username already exists"
        });
    }
    const existingEmail = await prisma.user.findUnique({
        where: { email: email }
    });
    if (existingEmail) {
        return res.status(409).json({
            message: "User with this email already exists"
        });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: {
            username: username,
            password: hashedPassword,
            email: email,
            name: name

        }
    });
    res.status(201).json({
        message: 'user registered successfully'
    });
}
exports.userLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { username: username }
        });
        if (!user) {
            return res.status(401).json({
                message: `there is no such user as ${username}`
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
                role: 'user'
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
exports.getUser = async (req, res) => {
    const user = await prisma.user.findFirst({
        where: {
            id: req.user.id
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
exports.updateUser = async (req, res) => {
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
exports.deleteUser = async (req, res) => {
    await prisma.user.delete({
        where: { id: req.user.id },
    });

    res.json({
        success: true,
        message: 'user deleted successfully',
    });
};
exports.createAComment = async (req, res) => {
    const postId = parseInt(req.params.postId);
    const { commentContent } = req.body;
    const comment = await prisma.comment.create({
        data: {
            content: commentContent,
            userId: req.user.id,
            postId: postId
        }
    })
    res.json({
        message: 'comment created',
        comment
    })
}

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
    res.json({
        message: 'all of posts:',
        allPosts: allPosts
    })
}
exports.getAPostPublic = async (req, res) => {
    const postId = parseInt(req.params.postId)
    const post = await prisma.post.findFirst({
        where: {
            id: postId
        }
    })
    res.json({
        message: 'here is the post:',
        post: post
    })
}
exports.getAuthorPublic = async (req, res) => {
    try {
        const { username } = req.params;

        const author = await prisma.author.findUnique({
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
        res.status(500).json({ message: 'Error fetching author' });
    }
};
