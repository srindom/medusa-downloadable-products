import { RouteConfig } from "@medusajs/admin";
import Table from "../../components/table";
import { Container } from "../../components/shared/container";
import { useAdminProductMedias } from "../../components/shared/hooks";
import { ListProductMediaRes } from "../../../types/product-media";
import { ProductMediaListParams } from "../../../api/routes/admin/product-media/list-product-media";

const ProductMediaList = () => {
  const { data } = useAdminProductMedias<
    ProductMediaListParams,
    ListProductMediaRes
  >();

  const productMedia = data?.product_medias || [];

  return (
    <Container>
      <Table>
        <Table.Head>
          <Table.HeadRow>
            <Table.HeadCell>Media</Table.HeadCell>
            <Table.HeadCell>Type</Table.HeadCell>
            <Table.HeadCell>Name</Table.HeadCell>
          </Table.HeadRow>
        </Table.Head>
        <Table.Body>
          {productMedia.map((media) => (
            <Table.Row clickable linkTo={`${media.id}`} key={media.id}>
              <Table.Cell>
                <div className="w-[100px] h-[100px] overflow-hidden p-3">
                  <img
                    className="w-full h-full object-contain"
                    src={media.file}
                    alt={media.name}
                  />
                </div>
              </Table.Cell>
              <Table.Cell>{media.mime_type}</Table.Cell>
              <Table.Cell>{media.name}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Container>
  );
};

export default ProductMediaList;
export const config: RouteConfig = {
  link: {
    label: "Product Media",
  },
};
