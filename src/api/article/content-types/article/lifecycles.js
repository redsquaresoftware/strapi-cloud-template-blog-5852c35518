const getDraftWhere = (entry) => {
  const where = {
    documentId: entry.documentId,
    publishedAt: null,
  };

  if (entry.locale !== undefined && entry.locale !== null) {
    where.locale = entry.locale;
  }

  return where;
};

module.exports = {
  beforeCreate(event) {
    const data = event?.params?.data;

    if (data?.publishedAt && !data.publishedDate) {
      data.publishedDate = data.publishedAt;
    }
  },

  beforeUpdate(event) {
    const data = event?.params?.data;

    if (data?.publishedAt && !data.publishedDate) {
      data.publishedDate = data.publishedAt;
    }
  },

  async afterCreate(event) {
    const entry = event?.result;

    if (!entry?.publishedAt || !entry?.documentId) {
      return;
    }

    await strapi.db.query('api::article.article').updateMany({
      where: getDraftWhere(entry),
      data: {
        publishedDate: entry.publishedAt,
      },
    });
  },

  async afterDelete(event) {
    const entry = event?.result;

    if (!entry?.publishedAt || !entry?.documentId) {
      return;
    }

    await strapi.db.query('api::article.article').updateMany({
      where: getDraftWhere(entry),
      data: {
        publishedDate: null,
      },
    });
  },
};
