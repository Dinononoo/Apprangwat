import { Redirect } from 'expo-router';

export default function IndexScreen() {
  // Redirect ไปยัง main screen เป็น default
  return <Redirect href="/(tabs)/main" />;
}
