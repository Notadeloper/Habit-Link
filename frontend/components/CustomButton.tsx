import { TouchableOpacity, Text } from "react-native";

import { ButtonProps } from "@/types/type";

const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
  switch (variant) {
  case "secondary":
    return "bg-primary-100";
  case "danger":
    return "bg-danger";
  case "success":
    return "bg-success";
  case "outline":
    return "bg-transparent border border-primary-200";
  default:
    return "bg-primary-500";
  }
};

const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
  switch (variant) {
  case "primary":
    return "text-black-300";
  case "secondary":
    return "text-primary-700";
  case "danger":
    return "text-white";
  case "success":
    return "text-white";
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
      className={`${sizeStyle} rounded-full flex flex-row justify-center items-center ${getBgVariantStyle(bgVariant)} ${className}`}
      {...props}
    >
      {IconLeft && <IconLeft />}
      <Text className={`${fontSizeStyle} font-rubik-bold ${getTextVariantStyle(textVariant)}`}>
        {title}
      </Text>
      {IconRight && <IconRight />}
    </TouchableOpacity>
  );
};

export default CustomButton;
