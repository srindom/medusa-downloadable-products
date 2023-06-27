import React, { useEffect, useState } from "react";
import FileUploadField from "../components/file-upload-field";
import { useNavigate } from "react-router-dom";
import { WidgetConfig, WidgetProps } from "@medusajs/admin";
import { Product } from "@medusajs/medusa";
import { NextSelect } from "../components/select";
import { Container } from "../components/shared/container";
import Button from "../components/shared/button";
import Table from "../components/table";
import {
  useAdminCreateProductMediaMutation,
  useAdminDeleteProductMediaMutation,
  useAdminProductMedia,
  useAdminProductMedias,
  useAdminUpdateOnboardingStateMutation,
} from "../components/shared/hooks";
import { ProductMediaListParams } from "../../api/routes/admin/product-media/list-product-media";
import {
  ListProductMediaRes,
  ProductMediaRes,
} from "../../types/product-media";
import { useAdminUploadFile } from "medusa-react";
import { AdminPostProductMediaReq } from "src/api/routes/admin/product-media/create-product-media";

const supportedProductTypes = ["Media"];

type InjectedProps = WidgetProps & {
  product: Product;
};

const ProductMediaEditor = (props: InjectedProps) => {
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [variantToAttach, setVariantToAttach] = useState(null);
  const [attachmentType, setAttachmentType] = useState<
    ("main" | "preview") | null
  >(null);
  const product = props.product;
  const isMediaType = supportedProductTypes.includes(product.type?.value);

  const { mutateAsync: uploadFile } = useAdminUploadFile();

  const createProductMedia = useAdminCreateProductMediaMutation<
    AdminPostProductMediaReq,
    ProductMediaRes
  >();
  const response = useAdminProductMedias<
    ProductMediaListParams,
    ListProductMediaRes
  >({
    expand: ["variants"],
    variant_id: product.variants.map((v) => v.id),
  });

  const productMediaList = response.data?.product_medias ?? [];

  if (!isMediaType) {
    return null;
  }

  const onCreateProductMedia = async (e) => {
    e.preventDefault();

    const uploadResult = await uploadFile(fileToUpload);
    const uploadedFileUrl = uploadResult.uploads[0].url;

    const res = await createProductMedia.mutateAsync({
      name: fileToUpload.name,
      file: uploadedFileUrl,
      mime_type: fileToUpload.type,
      product_variant: {
        id: variantToAttach,
        type: attachmentType,
      },
    });

    if (res.response) {
      if (res.response.status === 400) {
        props.notify.error("Error", "Product Media was not created");
      } else {
        props.notify.success(
          "Product Media Created",
          "Product Media was created"
        );

        setFileToUpload(null);
      }
    }
  };

  const handleFileChosen = (file: File[]) => {
    setFileToUpload(file[0]);
  };

  const humanizeSize = (file: File) => {
    if (file.size < 1000) {
      return `${file.size} B`;
    } else if (file.size < 1000000) {
      return `${Math.round(file.size / 1000)} KB`;
    } else {
      return `${Math.round(file.size / 1000000)} MB`;
    }
  };

  const handleVariantSelected = (value) => {
    setVariantToAttach(value.value);
  };

  const handleAttachmentTypeSelected = (value) => {
    setAttachmentType(value.value);
  };

  return (
    <Container>
      <h2 className="inter-xlarge-semibold">Product Media</h2>
      <div className="mt-base">
        <MediaTable>
          {productMediaList.map(
            (pm) =>
              pm.variants &&
              pm.variants.map((prodVariant) => {
                const productVariant = product.variants.find(
                  (v) => v.id === prodVariant.variant_id
                );
                if (!productVariant) {
                  return null;
                }

                return (
                  <Table.Row key={pm.id}>
                    <Table.Cell>
                      <img className="w-16 h-16 object-contain" src={pm.file} />
                    </Table.Cell>
                    <Table.Cell>{pm.name}</Table.Cell>
                    <Table.Cell>{productVariant.title}</Table.Cell>
                    <Table.Cell>{prodVariant.type}</Table.Cell>
                  </Table.Row>
                );
              })
          )}
        </MediaTable>

        {addingProduct ? (
          <form
            className="flex flex-col my-base min-h-[400px]"
            onSubmit={onCreateProductMedia}
          >
            {fileToUpload ? (
              <div className="flex flex-col gap-y-6 grow">
                <div className="flex gap-x-4 items-center">
                  <div className="w-1/3 aspect-square">
                    <img
                      className="w-full h-full object-contain"
                      src={URL.createObjectURL(fileToUpload)}
                    />
                  </div>
                  <ul>
                    <li>File name: {fileToUpload.name}</li>
                    <li>File size: {humanizeSize(fileToUpload)}</li>
                    <li>File type: {fileToUpload.type}</li>
                  </ul>
                </div>
                <div className="flex gap-x-4">
                  <NextSelect
                    label="Variant"
                    onChange={handleVariantSelected}
                    options={product.variants.map((v) => ({
                      label: v.title,
                      value: v.id,
                    }))}
                  />
                  <NextSelect
                    label="Attachment Type"
                    onChange={handleAttachmentTypeSelected}
                    options={[
                      { label: "Main", value: "main" },
                      { label: "Preview", value: "preview" },
                    ]}
                  />
                </div>
              </div>
            ) : (
              <FileUploadField
                className="grow"
                onFileChosen={handleFileChosen}
                filetypes={[]}
              />
            )}
            <div className="flex justify-end items-center mt-base gap-x-2">
              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  setAddingProduct(false);
                  setFileToUpload(null);
                  setVariantToAttach(null);
                  setAttachmentType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={!fileToUpload || !variantToAttach || !attachmentType}
                size="small"
                variant="primary"
                type="submit"
              >
                Add
              </Button>
            </div>
          </form>
        ) : (
          <div className="mt-4 flex justify-end items-center">
            <Button
              size="small"
              variant="secondary"
              onClick={() => setAddingProduct(true)}
            >
              Add Media
            </Button>
          </div>
        )}
      </div>
    </Container>
  );
};

const MediaTable = ({ children }) => {
  return (
    <Table>
      <Table.Head>
        <Table.HeadRow>
          <Table.HeadCell>File</Table.HeadCell>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>Variant</Table.HeadCell>
          <Table.HeadCell>Type</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.HeadRow>
      </Table.Head>
      <Table.Body>{children}</Table.Body>
    </Table>
  );
};

export const config: WidgetConfig = {
  zone: "product.details.after",
};

export default ProductMediaEditor;
