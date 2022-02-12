require("dotenv").config({});
const express = require("express");
const bodyParser = require("body-parser");
const Sequelize = require("sequelize");
const cors = require("cors");
const path = require("path");
const { start } = require("repl");
const Op = Sequelize.Op;

let sequelize;

if (process.env.NODE_ENV === "development") {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "sample.db",
    define: {
      timestamps: false,
    },
  });
} else {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
}

const Article = sequelize.define("article", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  titlu: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [5, 80],
    },
  },
  rezumat: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [10, 200],
    },
  },
  data: {
    type: Sequelize.DATEONLY,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

const Reference = sequelize.define("reference", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  titlu: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [5, 80],
    },
  },
  data: {
    type: Sequelize.DATEONLY,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  autori: {
    type: Sequelize.ARRAY(Sequelize.TEXT),
    allowNull: false,
  },
});

Article.hasMany(Reference, { foreignKey: "articleId" });
Reference.belongsTo(Article, { foreignKey: "articleId" });

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

app.get("/sync", async (req, res) => {
  try {
    await sequelize.sync({ force: true });
    res.status(201).json({ message: "tables created" });
  } catch (err) {
    console.warn(err);
    res.status(500).json({ message: "some error occured" });
  }
});

app.get("/articles", async (req, res) => {
  try {
    const query = {};
    let pageSize = 5;
    const allowedFilters = ["titlu", "rezumat", "data"];
    const filterKeys = Object.keys(req.query).filter(
      (e) => allowedFilters.indexOf(e) !== -1
    );
    if (filterKeys.length > 0) {
      query.where = {};
      for (const key of filterKeys) {
        query.where[key] = {
          [Op.like]: `%${req.query[key]}%`,
        };
      }
    }

    const sortField = req.query.sortField;
    let sortOrder = "ASC";
    if (req.query.sortOrder && req.query.sortOrder === "-1") {
      sortOrder = "DESC";
    }

    if (req.query.pageSize) {
      pageSize = parseInt(req.query.pageSize);
    }

    if (sortField) {
      query.order = [[sortField, sortOrder]];
    }

    if (!isNaN(parseInt(req.query.page))) {
      query.pageSize = pageSize;
      query.offset = pageSize * parseInt(req.query.page);
    }

    const records = await Article.findAll(query);
    const numberOfArticles = await Article.count();

    res.status(200).json({ records, numberOfArticles });
  } catch (e) {
    console.warn(e);
    res
      .status(500)
      .json({ message: "Server error - couldnt GET the articles" });
  }
});

app.post("/articles", async (req, res) => {
  try {
    await Article.create(req.body);
    res.status(201).json({ message: "article created" });
  } catch (err) {
    console.warn(err);
    res.status(500).json({ message: "server error" });
  }
});

app.get("/articles/:aid", async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.aid, {
      include: Reference,
    });
    if (article) {
      res.status(200).json(article);
    } else {
      res.status(404).json({ message: "article not found" });
    }
  } catch (err) {
    console.warn(err);
    res.status(500).json({ message: "server error" });
  }
});

app.put("/articles/:aid", async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.aid);
    if (article) {
      await article.update(req.body, {
        fields: ["titlu", "rezumat", "data"],
      });
      res.status(202).json({ message: "accepted" });
    } else {
      res.status(404).json({ message: "article not found" });
    }
  } catch (err) {
    console.warn(err);
    res.status(500).json({ message: "server error" });
  }
});

app.delete("/articles/:aid", async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.aid);
    if (article) {
      await article.destroy();
      res.status(202).json({ message: "accepted" });
    } else {
      res.status(404).json({ message: "article not found" });
    }
  } catch (err) {
    console.warn(err);
    res.status(500).json({ message: "server error" });
  }
});

app.get("/articles/:aid/references", async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.aid);
    if (article) {
      const references = await article.getReferences();
      res.status(200).json(references);
    } else {
      res.status(404).json({ message: "reference not found" });
    }
  } catch (err) {
    console.warn(err);
    res.status(500).json({ message: "server error" });
  }
});

app.post("/articles/:aid/references", async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.aid);
    if (article) {
      const reference = req.body;
      reference.articleId = article.id;
      await Reference.create(reference);
      res.status(201).json({ message: "reference created" });
    } else {
      res.status(404).json({ message: "reference not found" });
    }
  } catch (err) {
    console.warn(err);
    res.status(500).json({ message: "server error" });
  }
});

app.get("/articles/:aid/references/:rid", async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.aid);
    if (article) {
      const references = await article.getReferences({
        where: { id: req.params.rid },
      });
      const reference = references.shift();
      if (reference) {
        res.status(200).json(reference);
      } else {
        res.status(404).json({ message: "reference not found" });
      }
    } else {
      res.status(404).json({ message: "article not found" });
    }
  } catch (err) {
    console.warn(err);
    res.status(500).json({ message: "server error" });
  }
});

app.put("/articles/:aid/references/:rid", async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.aid);
    if (article) {
      const references = await article.getReferences({
        where: { id: req.params.rid },
      });
      const reference = references.shift();
      if (reference) {
        await reference.update(req.body);
        res.status(202).json({ message: "accepted" });
      } else {
        res.status(404).json({ message: " reference not found" });
      }
    } else {
      res.status(404).json({ message: "article not found" });
    }
  } catch (err) {
    console.warn(err);
    res.status(500).json({ message: "server error" });
  }
});

app.delete("/articles/:aid/references/:rid", async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.aid);
    if (article) {
      const references = await article.getReferences({
        where: { id: req.params.rid },
      });
      const reference = references.shift();
      if (reference) {
        await reference.destroy(req.body);
        res.status(202).json({ message: "accepted" });
      } else {
        res.status(404).json({ message: " reference not found" });
      }
    } else {
      res.status(404).json({ message: "article not found" });
    }
  } catch (err) {
    console.warn(err);
    res.status(500).json({ message: "server error" });
  }
});

app.listen(process.env.PORT, async () => {
  await sequelize.sync({ alter: true });
});
