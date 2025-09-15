import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { login } from "@/services/authService"

const Login = () => {
  const router = useRouter()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (isLoading) return
    setIsLoading(true)
    
    await login(email, password)
      .then((res) => {
        console.log(res)
        router.push("/home")
      })
      .catch((err) => {
        console.error(err)
        Alert.alert("Login Failed", "Invalid email or password")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6 py-8">
          {/* Logo and Header */}
          <View className="items-center mb-10">
            <View className="bg-blue-100 p-5 rounded-2xl mb-4">
              <Text className="text-3xl font-bold text-blue-600">PicMeUp</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-800">Lost & Found</Text>
            <Text className="text-gray-500 mt-2 text-center">
              Reconnect with your lost items
            </Text>
          </View>

          {/* Login Form */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-700 mb-6 text-center">
              Sign in to your account
            </Text>
            
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
              <TextInput
                placeholder="Enter your email"
                className="bg-gray-50 border border-gray-300 rounded-xl px-5 py-4 text-gray-800"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            
            <View className="mb-1">
              <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-xl px-5">
                <TextInput
                  placeholder="Enter your password"
                  className="flex-1 py-4 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                  autoComplete="password"
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Text className="text-blue-600 font-medium">
                    {isPasswordVisible ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Pressable className="self-end mb-6">
              <Text className="text-blue-600 text-sm font-medium">Forgot password?</Text>
            </Pressable>
            
            <TouchableOpacity
              className="bg-blue-600 p-5 rounded-xl shadow-lg"
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <Text className="text-center text-white text-lg font-semibold">Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Sign up link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-600">Don't have an account? </Text>
            <Pressable onPress={() => router.push("/register")}>
              <Text className="text-blue-600 font-semibold">Register</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default Login