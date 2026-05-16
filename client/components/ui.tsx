// UI组件 - 兼容Web和移动端
import { Text as RNText, View as RNView, TextInput as RNTextInput, TouchableOpacity, Modal as RNModal, ScrollView } from 'react-native';

// Card组件
export const Card = ({ children, className = '', style, ...props }: any) => (
  <RNView style={[{ backgroundColor: 'white', borderRadius: 16, padding: 16 }, style]} {...props}>
    {children}
  </RNView>
);

// Text组件
export const Text = ({ children, className = '', style, ...props }: any) => (
  <RNText style={[{ color: '#374151' }, style]} {...props}>
    {children}
  </RNText>
);

// View组件
export const View = ({ children, className = '', style, ...props }: any) => (
  <RNView style={style} {...props}>
    {children}
  </RNView>
);

// Badge组件
export const Badge = ({ children, className = '', style, ...props }: any) => (
  <RNView style={[{ backgroundColor: '#3B82F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }, style]} {...props}>
    <RNText style={{ color: 'white', fontSize: 12 }}>{children}</RNText>
  </RNView>
);

// Button组件
export const Button = ({ children, className = '', style, onPress, disabled, ...props }: any) => (
  <TouchableOpacity 
    style={[{ backgroundColor: disabled ? '#9CA3AF' : '#3B82F6', padding: 12, borderRadius: 12, alignItems: 'center' }, style]} 
    onPress={onPress} 
    disabled={disabled}
    {...props}
  >
    {typeof children === 'string' ? (
      <RNText style={{ color: 'white', fontWeight: '600' }}>{children}</RNText>
    ) : children}
  </TouchableOpacity>
);

// Input组件
export const Input = ({ className = '', style, multiline, ...props }: any) => (
  <RNTextInput 
    style={[
      { 
        backgroundColor: '#F9FAFB', 
        borderRadius: 12, 
        padding: 12, 
        fontSize: 16,
        minHeight: multiline ? 100 : 48,
        textAlignVertical: multiline ? 'top' : 'center',
        color: '#374151'
      }, 
      style
    ]} 
    placeholderTextColor="#9CA3AF"
    multiline={multiline}
    {...props} 
  />
);

// Modal组件
export const Modal = ({ visible, children, onClose, ...props }: any) => (
  <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose} {...props}>
    <RNView style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
      <RNView style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' }}>
        {children}
      </RNView>
    </RNView>
  </RNModal>
);

// ScrollView组件
export { ScrollView };
