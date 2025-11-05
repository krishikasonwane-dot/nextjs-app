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