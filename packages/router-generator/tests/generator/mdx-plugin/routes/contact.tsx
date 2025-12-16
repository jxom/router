import { createFileRoute } from '@tanstack/react-router'
import RouteComponent from './contact.mdx'

export const Route = createFileRoute('/contact')({
  component: RouteComponent,
})
