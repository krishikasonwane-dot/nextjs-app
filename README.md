This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
Thought for 2sI'll provide you with a comprehensive guide for connecting your Next.js frontend with a Django backend in the same project. This setup will include CORS configuration, folder structure, and working examples.

## Project Structure

```plaintext
project-root/
├── frontend/                 # Next.js app
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── api/             # Optional: Route handlers
│   ├── lib/
│   │   └── api.ts           # API client utilities
│   ├── components/
│   └── package.json
├── backend/                  # Django app
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── api/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── serializers.py
│   └── venv/
└── README.md
```

## Step 1: Configure Django CORS

### Backend: Install and Setup CORS

```shellscript
# In your Django backend, install django-cors-headers
pip install django-cors-headers
```

### `backend/config/settings.py`

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',  # Add this
    'rest_framework',  # For API endpoints
    'api',  # Your app
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Add this FIRST
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',      # Next.js dev server
    'http://127.0.0.1:3000',
    'https://yourdomain.com',     # Production
]

CORS_ALLOW_CREDENTIALS = True
```

## Step 2: Create Django API Endpoints

### `backend/api/models.py`

```python
from django.db import models

class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
```

### `backend/api/serializers.py`

```python
from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'created_at']
```

### `backend/api/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Post
from .serializers import PostSerializer

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent posts"""
        posts = Post.objects.all().order_by('-created_at')[:5]
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)
```

### `backend/api/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet

router = DefaultRouter()
router.register(r'posts', PostViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
```

### `backend/config/urls.py`

```python
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
```

## Step 3: Create API Client in Next.js

### `frontend/lib/api.ts`

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

// Fetch all posts
export async function getPosts(): Promise<Post[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/`);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    throw error;
  }
}

// Fetch recent posts
export async function getRecentPosts(): Promise<Post[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/recent/`);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to fetch recent posts:', error);
    throw error;
  }
}

// Create a post
export async function createPost(data: { title: string; content: string }): Promise<Post> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to create post:', error);
    throw error;
  }
}

// Update a post
export async function updatePost(
  id: number,
  data: { title: string; content: string }
): Promise<Post> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Failed to update post:', error);
    throw error;
  }
}

// Delete a post
export async function deletePost(id: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to delete post:', error);
    throw error;
  }
}
```

## Step 4: Use the API in Next.js Components

### `frontend/app/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getRecentPosts, Post } from '@/lib/api';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getRecentPosts();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Recent Posts</h1>
      
      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post.id} className="border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-700 mb-4">{post.content}</p>
            <time className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </time>
          </article>
        ))}
      </div>
    </main>
  );
}
```

## Step 5: Environment Variables

### `frontend/.env.local`

```shellscript
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Production `.env.local`

```shellscript
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

## Step 6: Run Both Services

### Terminal 1 - Django Backend

```shellscript
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

### Terminal 2 - Next.js Frontend

```shellscript
cd frontend
npm install
npm run dev
```

The frontend will be at `http://localhost:3000` and the backend at `http://localhost:8000`.

## Important Notes

- **CORS Configuration**: The CORS middleware in Django must be placed **before** other middleware
- **API URL**: Use environment variables to switch between development and production URLs
- **Error Handling**: Always implement proper error handling in your API calls
- **TypeScript**: Use typed interfaces for API responses to catch errors early
- **Credentials**: If you need to send cookies, add `credentials: 'include'` to your fetch requests and enable `CORS_ALLOW_CREDENTIALS = True`


This setup provides a solid foundation for your Next.js + Django integration!