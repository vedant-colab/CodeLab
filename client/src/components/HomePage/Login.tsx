import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { GithubIcon } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "../Misc/AuthContext"  // Import the useAuth hook

const formSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

const LoginComponent: React.FC <{ closeModal: () => void }>= ({ closeModal }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { login } = useAuth()  // Use the login function from AuthContext

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await axios.post('http://localhost:3000/api/v1/auth/tokenCreation', values)
      console.log(response)
      const token = response.data[0].token  // Adjust this based on your API response structure
      login(token)  // Call the login function with the received token
      toast({
        title: "Login successful",
        description: "You have been successfully logged in.",
      })
      closeModal()
    } catch (error: any) {
      console.error('Login error:', error)
      toast({
        title: "Login failed",
        description: error.response.data[0].messsage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center">
        <span className="text-gray-500">Or</span>
      </div>
      <Button variant="outline" className="w-full mt-4 flex items-center justify-center" onClick={() => console.log('GitHub sign up clicked')}>
        <GithubIcon className="mr-2 h-4 w-4" /> Sign up with GitHub
      </Button>
    </div>
  )
}

export default LoginComponent