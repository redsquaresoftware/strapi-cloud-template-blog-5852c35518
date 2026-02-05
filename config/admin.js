const getPreviewPathname = (uid, { document }) => {
  if (!document) {
    return null;
  }

  switch (uid) {
    case 'api::article.article': {
      const slug = document.slug;
      return slug ? `/blog/${encodeURIComponent(slug)}` : null;
    }
    case 'api::category.category': {
      const slug = document.slug;
      return slug ? `/category/${encodeURIComponent(slug)}` : null;
    }
    case 'api::about.about': {
      return '/about';
    }
    default:
      return null;
  }
};

module.exports = ({ env }) => {
  const rawClientUrl = env('CLIENT_URL');
  const clientUrl = rawClientUrl ? rawClientUrl.replace(/\/+$/, '') : undefined;
  const previewSecret = env('PREVIEW_SECRET');
  const previewEnabled = env.bool('PREVIEW_ENABLED', true) && clientUrl && previewSecret;

  return {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
    apiToken: {
      salt: env('API_TOKEN_SALT'),
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT'),
      },
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
    preview: previewEnabled
      ? {
          enabled: true,
          config: {
            allowedOrigins: clientUrl,
            async handler(uid, { documentId, locale, status }) {
              const document = await strapi.documents(uid).findOne({ documentId });
              if (!document) {
                return null;
              }

              const pathname = getPreviewPathname(uid, { locale, document });
              if (!pathname) {
                return null;
              }

              const urlSearchParams = new URLSearchParams({
                url: pathname,
                secret: previewSecret,
              });

              if (status) {
                urlSearchParams.set('status', status);
              }

              if (locale) {
                urlSearchParams.set('locale', locale);
              }

              return `${clientUrl}/api/preview?${urlSearchParams.toString()}`;
            },
          },
        }
      : {
          enabled: false,
        },
  };
};
