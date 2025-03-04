import { TouchableOpacity, Text } from "react-native";

import { ButtonProps } from "@/types/type";

const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
  switch (variant) {
  case "secondary":
    return "bg-gray-500";
  case "danger":
    return "bg-red-500";
  case "success":
    return "bg-green-500";
  case "outline":
    return "bg-transparent border-neutral-300 border-[0.5px]";
  default:
    return "bg-[#53a92c]";
  }
};

const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
  switch (variant) {
  case "primary":
    return "text-black";
  case "secondary":
    return "text-gray-100";
  case "danger":
    return "text-red-100";
  case "success":
    return "text-green-100";
  default:
    return "text-white";
  }
};

const getSizeStyle = (size: ButtonProps["size"]) => {
  switch (size) {
  case "small":
    return "w-1/2 p-2";
  case "large":
    return "w-full p-4";
  case "normal":
  default:
    return "w-3/4 p-3";
  }
};

const getFontSizeStyle = (size: ButtonProps["size"]) => {
  switch (size) {
  case "small":
    return "text-base";
  case "large":
    return "text-xl";
  case "normal":
  default:
    return "text-lg";
  }
};

const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  size = "normal",
  IconLeft,
  IconRight,
  className = "",
  ...props
}: ButtonProps) => {
  const sizeStyle = getSizeStyle(size);
  const fontSizeStyle = getFontSizeStyle(size);
    
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${sizeStyle} rounded-full flex flex-row justify-center items-center shadow-md shadow-neutral-400/70 ${getBgVariantStyle(bgVariant)} ${className}`}
      {...props}
    >
      {IconLeft && <IconLeft />}
      <Text className={`${fontSizeStyle} font-bold ${getTextVariantStyle(textVariant)}`}>
        {title}
      </Text>
      {IconRight && <IconRight />}
    </TouchableOpacity>
  );
};

export default CustomButton;