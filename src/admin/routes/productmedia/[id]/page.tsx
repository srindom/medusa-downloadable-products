import { useAdminVariants } from "medusa-react";
import { useParams } from "react-router-dom";
import Table from "../../../components/table";
import { Container } from "../../../components/shared/container";
import { useAdminProductMedia } from "../../../components/shared/hooks";
import { ProductMediaRes } from "../../../../types/product-media";

const ProductMediaList = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useAdminProductMedia<ProductMediaRes>(id);

  const productMedia = data?.product_media;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Container>
        <div className="flex items-center space-x-6">
          <div className="w-[100px] h-[100px] overflow-hidden p-3">
            <img
              className="w-full h-full object-contain"
              src={productMedia.file}
              alt={productMedia.name}
            />
          </div>
        </div>
        <div className="mt-6 flex space-x-6 divide-x">
          <div className="flex flex-col">
            <div className="inter-smaller-regular text-grey-50 mb-1">Name</div>
            <div>{productMedia.name}</div>
          </div>
          <div className="flex flex-col pl-6">
            <div className="inter-smaller-regular text-grey-50 mb-1">
              Mime Type
            </div>
            <div className="max-w-[200px] truncate">
              {productMedia.mime_type}
            </div>
          </div>
        </div>
      </Container>
      <Container>
        {/* Show Connected Variants */}
        <Table>
          <Table.Head>
            <Table.HeadRow>
              <Table.HeadCell>Variant</Table.HeadCell>
              <Table.HeadCell>SKU</Table.HeadCell>
              <Table.HeadCell>Attachment Type</Table.HeadCell>
            </Table.HeadRow>
          </Table.Head>
          <Table.Body>
            {productMedia.variants.map((variant) => (
              <VariantRow key={variant.id} attachment={variant} />
            ))}
          </Table.Body>
        </Table>
      </Container>
    </>
  );
};

const VariantRow = ({ attachment }) => {
  const { variants, isLoading } = useAdminVariants({
    id: attachment.variant_id,
  });

  const variant = variants?.[0];

  return (
    <Table.Row>
      <Table.Cell>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className="flex gap-x-2 items-center">
            <div>
              {variant.product.thumbnail && (
                <img
                  className="w-8 h-8 object-contain"
                  src={variant.product.thumbnail}
                  alt={variant.product.title}
                />
              )}
            </div>

            <div className="flex flex-col">
              <strong>{variant.product.title}</strong>
              <div className="text-grey-50">{variant.title}</div>
            </div>
          </div>
        )}
      </Table.Cell>
      <Table.Cell>
        {isLoading ? <div>Loading...</div> : <div>{variants[0].sku}</div>}
      </Table.Cell>
      <Table.Cell>{<div>{attachment.type}</div>}</Table.Cell>
    </Table.Row>
  );
};

export default ProductMediaList;
