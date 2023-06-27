import { useEffect, useState } from "react";
import { createCustomAdminHooks } from "medusa-react";

const {
  useAdminEntity: useAdminOnboardingState,
  useAdminUpdateMutation: useAdminUpdateOnboardingStateMutation,
} = createCustomAdminHooks("onboarding", "onboarding_state");

const {
  useAdminEntity: useAdminProductMedia,
  useAdminEntities: useAdminProductMedias,
  useAdminCreateMutation: useAdminCreateProductMediaMutation,
  useAdminDeleteMutation: useAdminDeleteProductMediaMutation,
  useAdminUpdateMutation: useAdminUpdateProductMediaMutation,
} = createCustomAdminHooks("product-media", "product_media");

const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return dimensions;
};

export {
  useWindowDimensions,
  useAdminCreateProductMediaMutation,
  useAdminDeleteProductMediaMutation,
  useAdminOnboardingState,
  useAdminProductMedia,
  useAdminProductMedias,
  useAdminUpdateOnboardingStateMutation,
  useAdminUpdateProductMediaMutation,
};
