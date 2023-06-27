# Medusa Downloadable Products

## Getting started

**Note:** Make sure you have a Postgres DB set up and running and a `.env` file created with the relevant variables specified in `.env.template`.

```
yarn
yarn build
npx @medusajs/medusa-cli@latest migrations run
yarn seed
npx @medusajs/medusa-cli user -e [your email] -p [a secret password]
yarn dev
```

The admin dashboard will open and you can log in. To see the product media widget, create a new product with type "Media" and navigate to the product details page.

## How it works?

### High-level overview

The customizations in this project allow the following:

- Merchants can upload a file and associate it with a product variant.
- Merchants can specify if the file<->variant association should be a "preview" or a "main" file.
- Merchants can manage files from the admin dashboard on individual product pages and view all files from a list view.
- Customers can view previews through a custom storefront API.
- When customers place an order a subscriber checks if line items contain a downloadable product and creates a unique download token that can be sent to the customer's email using a notification plugin.

### Data model

Two entities have been added to the project: `ProductMedia` and `ProductMediaVariant`. You can view them in [`src/model`](https://github.com/srindom/medusa-downloadable-products/tree/main/src/models).

- `ProductMedia` holds the media details about a given download. This includes things like the url where the file can be accessed and the type of the file.
- `ProductMediaVariant` holds the assocation between `ProductMedia` and `ProductVariant`s including the type of association.

### Admin Extensions

The project has a few extensions:

- A Widget injected on `product.details.after` that is conditionally shown when the product type is "Media".
  - The widget enables merchants to upload a file and associate it with one of the product's variants.
- A UI Route to show a list of all `ProductMedia` in the store.
- A Dynamic UI Route to show the details of a specific `ProductMedia`.

You can find the extensions in [`src/admin`[(https://github.com/srindom/medusa-downloadable-products/tree/main/src/admin)

### Subscriber

A subscriber listens to `order.placed` and checks whether one or more of the order's line items contains a variant with an associated file. For each line item it finds it creates a download token and emits an event called `product-media.send-media` which a notification provider can be configured to send messages out to.

You can view the subscriber in [`src/subscribers`](https://github.com/srindom/medusa-downloadable-products/tree/main/src/subscribers)

### Admin APIs

There are Admin APIs to manage ProductMedia and its associations with variants.

You can find the code for the Admin API in [`src/api/routes/admin/product-media`](https://github.com/srindom/medusa-downloadable-products/tree/main/src/api/routes/admin/product-media)

### Storefront APIs

There are two storefront endpoints in the project:

1. `GET /store/product-media` - this endoint can be used to list product media previews in a storefront.

   - For example, on a PDP I might want to do `GET /store/product-media?variant_id=[selected id]` to fetch the relevant file and display it to the customer.

2. `GET /store/:token` - this endpoint checks if the passed token is valid and, if so, gives the customer access to the downloadable file associated with the product they bought. The token should be the one created in the `order.placed` subscriber. Right now the endpoint redirects the user to the file url - a better solution would maybe proxy the file through Medusa or signed URL with the storage provider.

## TODOs

This was done in a couple of hours and would need some more work to be production-ready. A few immediate ideas include:

- Being able to remove associations to variants from admin. (Both in the widget and in UI routes)
- Being able to delete product media from admin. The API is implemented but UI support is missing.
- Adding signed urls to file downloads - current approach redirects to a public file.
- Adding a view in `order.details.after` to see a list of line items with downloadable products in an order.
