"use client"; // This line is for Next.js client-side rendering

import { useEffect, useState } from "react";
import axios from "axios";
import styles from '../styles/Forum.module.css';

export default function Forum() {
    const [posts, setPosts] = useState([]);
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get("http://localhost:5000/posts", {
                    headers: {
                        "Authorization": `Bearer ${token}`, // Send token in Authorization header
                    },
                });

                setPosts(response.data); // Set the fetched posts
            } catch (error) {
                console.error("Error fetching posts:", error);
                alert("Failed to fetch posts");
            }
        };

        fetchPosts();
    }, [token]); // Make sure to trigger refetch if the token changes

    const handleCreatePost = async () => {
        const title = prompt("Enter post title:");
        const content = prompt("Enter post content:");

        try {
            const response = await axios.post(
                "http://localhost:5000/create-post",
                { token, title, content }
            );

            if (response.status === 201) {
                alert("Post created successfully!");
                setPosts((prevPosts) => [response.data, ...prevPosts]); // Adding the new post to the top
            } else {
                alert("Failed to create post.");
            }
        } catch (error) {
            console.error("Error creating post:", error);
            alert("Failed to create post.");
        }
    };

    return (
        <div className={styles.forumContainer}>
            <h1 className={styles.title}>Forum</h1>
            {role === "admin" && (
                <button className={styles.createPostButton} onClick={handleCreatePost}>
                    Add Post
                </button>
            )}
            <ul className={styles.postList}>
                {posts.map((post) => (
                    <li key={post.id} className={styles.postItem}>
                        <h3 className={styles.postTitle}>{post.title}</h3>
                        <p className={styles.postContent}>{post.content}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
