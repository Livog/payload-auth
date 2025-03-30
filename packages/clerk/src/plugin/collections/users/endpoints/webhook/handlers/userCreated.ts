import { Payload } from 'payload'
import { ClerkUser, ClerkPluginOptions } from '../../../../../../types'
import { findUserFromClerkUser } from '../../../../../../utils/user'

interface UserCreatedHandlerParams {
  data: any
  payload: Payload
  userSlug: string
  mappingFunction: (clerkUser: ClerkUser) => Record<string, any>
  options: ClerkPluginOptions
}

export async function handleUserCreated({
  data,
  payload,
  userSlug,
  mappingFunction,
  options
}: UserCreatedHandlerParams): Promise<void> {
  const clerkUser = data as ClerkUser
  
  try {
    const existingUsers = await findUserFromClerkUser({
      payload,
      userSlug,
      clerkUser
    })
    
    if (existingUsers.docs.length === 0) {
      let userData = {
        ...mappingFunction(clerkUser),
      }
      
      if (!userData.role) {
        userData.role = 'user'
      }

      if(!userData.password) {
        userData.password = Array(3)
          .fill(0)
          .map(() => Math.random().toString(36).slice(2))
          .join('')
      }
      
      await payload.create({
        collection: userSlug,
        data: userData,
      })
      
      if (options.enableDebugLogs) {
        console.log(`Created new user from Clerk: ${clerkUser.id}`)
      }
    }
  } catch (error) {
    console.error('Error creating user from Clerk webhook:', error)
  }
} 