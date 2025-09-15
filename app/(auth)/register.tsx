import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native"
import React, { useState } from "react"
import { useRouter } from "expo-router"
import { register } from "@/services/authService"

const Register = () => {
  const router = useRouter()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState<boolean>(false)

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }

    if (isLoading) return
    setIsLoading(true)
    
    await register(email, password)
      .then((res) => {
        console.log(res)
        Alert.alert("Success", "Account created successfully!")
        router.back()
      })
      .catch((err) => {
        console.error(err)
        Alert.alert("Registration Failed", "Something went wrong")
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
          <View className="items-center mb-8">
            <View className="bg-blue-100 p-5 rounded-2xl mb-4">
              <Text className="text-3xl font-bold text-blue-600">PickMeUp</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-800">Create Account</Text>
            <Text className="text-gray-500 mt-2 text-center">
              Join our community to find lost items
            </Text>
          </View>

          {/* Registration Form */}
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-700 mb-6 text-center">
              Sign up to get started
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
            
            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2">Password</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-xl px-5">
                <TextInput
                  placeholder="Create a password"
                  className="flex-1 py-4 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                  autoComplete="password-new"
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Text className="text-blue-600 font-medium">
                    {isPasswordVisible ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Confirm Password</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-300 rounded-xl px-5">
                <TextInput
                  placeholder="Confirm your password"
                  className="flex-1 py-4 text-gray-800"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!isConfirmPasswordVisible}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoComplete="password-new"
                />
                <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                  <Text className="text-blue-600 font-medium">
                    {isConfirmPasswordVisible ? "Hide" : "Show"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity
              className="bg-green-600 p-5 rounded-xl shadow-lg"
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <Text className="text-center text-white text-lg font-semibold">Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text className="text-xs text-gray-500 text-center mb-8 px-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>

          {/* Login link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <Pressable onPress={() => router.back()}>
              <Text className="text-blue-600 font-semibold">Login</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default Register