import type { AuthStrategy } from 'payload'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '../utils/user'

/**
 * Authentication strategy for Clerk
 * Integrates Payload with Clerk using the official Clerk auth method
 * 
 * @param adminRoles - Admin roles
 * @param userSlug - User collection slug
 * @returns Auth strategy
 */
export function clerkAuthStrategy(userSlug: string = 'users'): AuthStrategy {
  return {
    name: 'clerk',
    authenticate: async ({ payload }) => {
      try {

        const { userId } = await auth()
        
        if (!userId) {
          return { user: null }
        }
        
        const user = await getUserByClerkId(payload, userSlug, userId)
        
        if (!user) {
          return { user: null }
        }
        
        return {
          user: {
            ...user,
            collection: userSlug,
            _strategy: 'clerk',
          },
        }
      } catch (error) {
        console.error('Error in Clerk auth strategy:', error)
        return { user: null }
      }
    },
  }
} 