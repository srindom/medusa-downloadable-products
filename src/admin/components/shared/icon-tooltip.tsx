import React from "react";
import Tooltip, { TooltipProps } from "./tooltip";
import AlertIcon from "./alert-icon";
import InfoIcon from "./info-icon";
import IconProps from "../../types/icon-type";
import XCircleIcon from "./x-circle-icon";

type IconTooltipProps = TooltipProps & {
  type?: "info" | "warning" | "error";
} & Pick<IconProps, "size">;

const IconTooltip: React.FC<IconTooltipProps> = ({
  type = "info",
  size = 16,
  body,
  ...props
}) => {
  const icon = (type: IconTooltipProps["type"]) => {
    switch (type) {
      case "warning":
        return <AlertIcon size={size} className="text-orange-40 flex" />;
      case "error":
        return <XCircleIcon size={size} className="text-rose-40 flex" />;
      default:
        return <InfoIcon size={size} className="text-grey-40 flex" />;
    }
  };

  return (
    <Tooltip body={body} {...props}>
      {icon(type)}
    </Tooltip>
  );
};

export default IconTooltip;
