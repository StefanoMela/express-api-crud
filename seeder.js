const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const posts = [];

for(let i=0; i<100; i++){
    const post = {
        title: `Post ${i}`,
        image: 'picsum.com/',
        published: Boolean(Math.round(Math.random())),
        category: Boolean(Math.round(Math.random())),
        tags: Boolean(Math.round(Math.random())),
    }
    posts.push(post);
}

prisma.post.createMany({
    data: posts
})
.then(count => console.log(count))
.catch(err => console.error(err));