import {
  TextInput,
  View,
  Text,
  Image,
  Platform,
} from "react-native";
  
import { InputFieldProps } from "@/types/type";
  
const InputField = ({
  label,
  icon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  ...props
}: InputFieldProps) => {
  return (
    <View className={`my-2 w-full ${className}`}>
      <Text className={`mb-3 font-rubik text-base text-black-300 ${labelStyle}`}>
        {label}
      </Text>
      <View
        className={`flex flex-row items-center rounded-[24px] border border-primary-200 bg-white px-2 ${containerStyle}`}
      >
        {icon && (
          <Image source={icon} className={`w-6 h-6 ml-4 ${iconStyle}`} />
        )}
        <TextInput
          className={`flex-1 rounded-[24px] p-4 font-rubik text-[15px] text-black-300 ${inputStyle}`}
          placeholderTextColor="#71806f"
          secureTextEntry={secureTextEntry}
          style={Platform.OS === "web" ? ({ outlineStyle: "none" } as never) : undefined}
          {...props}
        />
      </View>
    </View>
  );
};
  
export default InputField;
