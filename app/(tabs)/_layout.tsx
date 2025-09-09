import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // ซ่อน tab bar เพราะใช้ custom UI
      }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: 'หน้าหลัก',
        }} 
      />
      <Tabs.Screen 
        name="main" 
        options={{ 
          headerShown: false,
          title: 'หน้าหลัก',
        }} 
      />
      <Tabs.Screen 
        name="measure" 
        options={{ 
          headerShown: false,
          title: 'ตรวจวัด',
        }} 
      />
    </Tabs>
  );
}