const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createSlug = (title) => {
    sluggedT = title.toLowerCase().replace(/\s+/g, "-");
    return sluggedT;
}
const index = async (req, res) => {
    try {
        let where = {}; // Definisci un oggetto per i filtri

        // Verifica se sono presenti filtri nella query string
        const { published, category, content, page = 1, limit = 5 } = req.query;
        if (published) {
            where.published = published === 'true'; // Converte la stringa in booleano
        }
        if (category) {
            where.categoryId = parseInt(category); // Assicurati che category sia un numero
        }
        if (content) {
            // Applica il filtro per il contenuto del post
            where.content = {
                contains: content
            };
        }

        // paginazione

        const offset = (page - 1) * limit;

        const totalItems = await prisma.post.count({where});
        const totalPages = Math.ceil(totalItems / limit);

        if(page > totalPages){
            res.status(404).send('not found');
        }

        // Esegui la query
        const posts = await prisma.post.findMany({
            where,
            take: parseInt(limit),
            skip: parseInt(offset),
            include: {
                category: {
                    select: {
                        name: true
                    },
                },
                tags: {
                    select: {
                        name: true
                    },
                }
            }
        });

        res.json({
            data: posts,
            page: page,
            totalItems,
            totalPages
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const show = async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await prisma.post.findUnique({
            where: { slug: slug }
        });
        if (post) {
            res.json(post);
        } else {
            res.status(404).send('Not found');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}
const create = async (req, res) => {
    const { title, image, content, categoryId, tags } = req.body;

    const data = {
        title,
        slug: createSlug(title),
        image,
        content,
        published: req.body.published ? true : false,
        category: {
            connect: { id: categoryId }
        },
        tags: {
            connect:
                tags ? tags.map(id => ({ id })) : []
        }
    };

    try {
        const post = await prisma.post.create({ data });
        console.log('post correttamente creato');
        res.status(201).json({ post });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const update = async (req, res) => {
    try {
        const { slug } = req.params;
        const post = await prisma.post.update({
            where: { slug: slug },
            data: req.body
        });
        res.json(post)
    }
    catch (err) {
        res.status(404).send('not found')
    }
}

const destroy = async (req, res) => {
    const { slug } = req.params;
    await prisma.post.delete({
        where: { slug: slug }
    });
    res.json('Post con slug' + slug + 'eliminato con successo');
}

module.exports = {
    index,
    create,
    show,
    update,
    destroy,
};