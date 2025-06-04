import { useEffect, useState } from "react";
// import '../components/Post'
import "./Posts.css";
function Posts() {
  const [view, setView] = useState("mine");
  const [postsArray, setPostsArray] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [newPost, setNewPost] = useState({
    title: "",
    body: "",
  });

  // const [messagePost, setMessagePost] = useState("");
  // const [expandedPosts, setExpandedPosts] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));
  const MyUserId = user.id;

  //הבאת פוסטים מהשרת
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`http://localhost:3001/posts`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();

        if (view === "mine") {
          // פוסטים שלי
          const myPosts = data.filter(
            (post) => String(post.userId) === MyUserId
          );
          setPostsArray(myPosts);
          setFilteredPosts(myPosts);
        } else if (view === "others") {
          // פוסטים של אחרים
          const otherPosts = data.filter(
            (post) => String(post.userId) !== MyUserId
          );
          setPostsArray(otherPosts);
          setFilteredPosts(otherPosts);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [view, MyUserId]);


  //שינוי מצב התצוגה בין פוסטים שלי לפוסטים של אחרים
  const handleViewChange = (newView) => {
    setView(newView);
    setSearchId("");
    setSearchTitle("");
  };

  // חיפוש פוסטים לפי מזהה או כותרת
  useEffect(() => {
    const result = postsArray.filter((post) => {
      return (
        (searchId ? post.id.toString().includes(searchId) : true) &&
        (searchTitle
          ? post.title.toLowerCase().includes(searchTitle.toLowerCase())
          : true)
      );
    });
    setFilteredPosts(result); // הצגת הפוסטים המפולטרים
  }, [searchId, searchTitle, postsArray]);

  //הוספת פוסט
  const handleAddPost = async () => {
    const newPostObj = {
      userId: MyUserId,
      title: newPost.title,
      body: newPost.body,
    };

    try {
      const response = await fetch(`http://localhost:3001/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPostObj),
      });

      if (!response.ok) {
        throw new Error("Failed to add new post");
      }

      const data = await response.json();
      setPostsArray([data, ...postsArray]);
      setFilteredPosts([data, ...filteredPosts]);
      setNewPost({ title: "", body: "" }); // מאפס את שדות הפוסט החדש לאחר הוספה
      console.log("New post added:", data);
    } catch (error) {
      console.error("Error adding post:", error);
      alert("An error occurred while adding the post. Please try again.");
    }
  };

  return (
    <>
      <h1>posts</h1>
      <div>
        {/* כפתורי בחירה */}
        <button
          onClick={() => handleViewChange("mine")}
          style={{ fontWeight: view === "mine" ? "bold" : "normal" }}
        >
          הפוסטים שלי
        </button>
        <button
          onClick={() => handleViewChange("others")}
          style={{ fontWeight: view === "others" ? "bold" : "normal" }}
        >
          פוסטים מאת משתמשים אחרים
        </button>
      </div>
      <div>
        <input
          type="text"
          placeholder="Search by ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Title"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
      </div>

      <div>
        <h2>Add a New Post</h2>
        <input
          type="text"
          placeholder="Title"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        />
        <textarea
          placeholder="Body"
          value={newPost.body}
          onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
        ></textarea>
        <button onClick={handleAddPost}>Add Post</button>
      </div>

      <ul>
        {filteredPosts.map((post) => (
          <li key={post.id}>
            <Post
              post={post}
              selectedPost={selectedPost}
              setSelectedPost={setSelectedPost}
              view={view}
              postsArray={postsArray}
              setPostsArray={setPostsArray}
              filteredPosts={filteredPosts}
              setFilteredPosts={setFilteredPosts}
            ></Post>
          </li>
        ))}
      </ul>
    </>
  );
}

function Post({
  post,
  selectedPost,
  setSelectedPost,
  view,
  postsArray,
  setPostsArray,
  filteredPosts,
  setFilteredPosts,
}) {
  //סטייטים
  //סטייט לעריכת פוסט
  const [editingPostId, setEditingPostId] = useState(null);
  //סטייט להוספת פוסט
  const [addingCommentPostId, setAddingCommentPostId] = useState(null);
  //סטייט להוספת תגובה
  const [newComment, setNewComment] = useState({
    name: "",
    body: "",
  });
  //סטייט למערך התגובות
  const [comments, setComments] = useState([]);
  //סטייט למצב תצוגת התגובות
  const [showComments, setShowComments] = useState({});

  //פונקציה לשינוי מצב תצוגת התגובות
  const toggleComments = (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };
  //הוצאת המשתמש הנוכחי מהלוקאל סטורג
  const user = JSON.parse(localStorage.getItem("user"));

  //מחיקת פוסט
  const handleDeletePost = (postId) => {
    fetch(`http://localhost:3001/posts/${postId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        setPostsArray(postsArray.filter((post) => post.id !== postId));
        setFilteredPosts(filteredPosts.filter((post) => post.id !== postId));
        console.log(`Post with ID ${postId} deleted.`);
      })
      .catch((error) => console.error("Error deleting post:", error));
  };

  //עדכון פוסט
  const handleUpdatePost = (postId) => {
    const updatedPost = {
      title: selectedPost.title,
      body: selectedPost.body,
    };

    fetch(`http://localhost:3001/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedPost),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        setPostsArray(
          postsArray.map((post) =>
            post.id === postId ? { ...post, ...updatedPost } : post
          )
        );
        setFilteredPosts(
          filteredPosts.map((post) =>
            post.id === postId ? { ...post, ...updatedPost } : post
          )
        );
        setSelectedPost(data); // מעדכן את הפוסט הנבחר
        setEditingPostId(null);
        console.log("Post updated:", data);
      })
      .catch((error) => console.error("Error updating post:", error));
  };

  //הבאת תגובות מהשרת לפי מזהה פוסט
  const getComments = async (postId) => {
    console.log("Attempting to fetch comments for post ID:", postId);
    try {
      const response = await fetch(
        `http://localhost:3001/comments?postId=${postId}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch comments for post ID: ${postId}`);
      }
      const data = await response.json();
      console.log("Fetched comments:", data);
      // setComments(data.filter((c) => c.postId !== null));
      setComments((prevComments) => [
        ...prevComments.filter((c) => c.postId !== postId), // סינון תגובות קודמות של אותו פוסט
        ...data, // הוספת התגובות החדשות
      ]);
    } catch (error) {
      console.error("Error fetching comments:", error);
      alert("An error occurred while fetching comments. Please try again.");
    }
  };

  //הוספת תגובה
  const addComment = async (postId) => {
    const newCommentObj = {
      postId: postId,
      name: newComment.name,
      email: user.email,
      body: newComment.body,
    };

    try {
      const response = await fetch(`http://localhost:3001/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCommentObj),
      });

      if (!response.ok) {
        throw new Error(`Failed to add comment for post ID: ${postId}`);
      }

      const data = await response.json();
      setComments([...comments, data]);
      setNewComment({ name: "", body: "" });
      setAddingCommentPostId(null);
      console.log("Comment added:", data);
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("An error occurred while adding the comment. Please try again.");
    }
  };

  return (
    <>
      <p>
        <strong>post ID: </strong>
        {post.id}
      </p>
      <p>
        <strong>post title: </strong>
        {post.title}
      </p>

      <button
        onClick={() => {
          if (!selectedPost || selectedPost.id !== post.id) {
            setSelectedPost(post); // Open details
          } else {
            setSelectedPost(null); // Close details
          }
        }}
      >
        {selectedPost && selectedPost.id === post.id
          ? "Hide Details"
          : "Show Details"}
      </button>

      {selectedPost && selectedPost.id === post.id && (
        <div className="postBody">
          <p>
            <strong>Body:</strong>
          </p>
          <p>{selectedPost.body}</p>

          {view === "mine" && (
            <>
              <button onClick={() => handleDeletePost(post.id)}>Delete</button>
              <button onClick={() => setEditingPostId(post.id)}>Edit</button>
            </>
          )}

          <button
            onClick={() => {
              toggleComments(post.id);
              if (!showComments[post.id]) {
                console.log("Fetching comments for post ID:", post.id);
                getComments(post.id); // Fetch comments only when opening
              }
            }}
          >
            {showComments[post.id] ? "Hide Comments" : "Show Comments"}
          </button>

          {showComments[post.id] && (
            <Comments
              
                post={post}
                comments={comments}
                user={user}
                setComments={setComments}
                newComment={newComment}
                setNewComment={setNewComment}
                addingCommentPostId={addingCommentPostId}
                setAddingCommentPostId={setAddingCommentPostId}
                addComment={addComment}
                showComments={showComments}
              
            />
          )}

          {editingPostId === post.id && (
            <div className="editPost">
              <h3>Update Post</h3>
              <input
                type="text"
                placeholder="New Title"
                value={selectedPost.title}
                onChange={(e) =>
                  setSelectedPost({
                    ...selectedPost,
                    title: e.target.value,
                  })
                }
              />
              <textarea
                placeholder="New Body"
                value={selectedPost.body}
                onChange={(e) =>
                  setSelectedPost({
                    ...selectedPost,
                    body: e.target.value,
                  })
                }
              ></textarea>
              <button onClick={() => handleUpdatePost(post.id)}>Save</button>
              <button onClick={() => setEditingPostId(null)}>Cancel</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function Comments({
  post,
  comments,
  user,
  setComments,
  newComment,
  setNewComment,
  addingCommentPostId,
  setAddingCommentPostId,
  addComment,
  showComments
}) {
  console.log(showComments[post.id]);

  return (
    <>
      {showComments[post.id] && (
        <>

          <h3>Comments:</h3>
          <ul>
            {comments
              .map((comment) => (
                <li key={comment.id}>
                  <Comment
                    postId={post.id}
                    user={user}
                    comment={comment}
                    comments={comments}
                    setComments={setComments}
                    newComment={newComment}
                    setNewComment={setNewComment}
                  />
                </li>
              ))}
          </ul>
          <button onClick={() => setAddingCommentPostId(!addingCommentPostId)}>
            Add Comment
          </button>
          {addingCommentPostId && (
            <div className="addComment">
              <input
                type="text"
                placeholder="Comment Name"
                value={newComment.name}
                onChange={(e) =>
                  setNewComment({ ...newComment, name: e.target.value })
                }
              />
              <textarea
                placeholder="Comment Body"
                value={newComment.body}
                onChange={(e) =>
                  setNewComment({ ...newComment, body: e.target.value })
                }
              ></textarea>
              <div>
                <button onClick={() => addComment(post.id)}>
                  Save Comment
                </button>
                <button onClick={() => setAddingCommentPostId(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

function Comment({
  postId,
  user,
  comment,
  comments,
  setComments,
  newComment,
  setNewComment,
}) {
  const [editingCommentId, setEditingCommentId] = useState(null);

  //מחיקת תגובה
  const deleteComment = (commentId) => {
    fetch(`http://localhost:3001/comments/${commentId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        setComments(comments.filter((c) => c.id !== commentId));
        console.log(`Comment with ID ${commentId} deleted.`);
      })
      .catch((error) => console.log("Error deleting comment:", error));
  };

  // עריכת תגובה
  const handleEditComment = (commentId, postId) => {
    const updatedComment = {
      postId: postId,
      id: commentId,
      name: newComment.name,
      email: user.email,
      body: newComment.body,
    };
    fetch(`http://localhost:3001/comments/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedComment),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("post update: ", data);
        console.log(comment[postId]);
        setComments((prevComments) =>
          prevComments.map((c) =>
            c.id === commentId
              ? { ...c, name: newComment.name, body: newComment.body }
              : c
          )
        );
        setEditingCommentId(null);
      })
      .catch((error) => console.error("Error updating comment:", error));
  };

  return (
    <>
      <p>
        <strong>Comment ID:</strong> {comment.id}
      </p>
      <p>
        <strong>Name:</strong> {comment.name}
      </p>
      <p>
        <strong>Email:</strong> {comment.email}
      </p>
      <p>
        <strong>Body:</strong> {comment.body}
      </p>
      {comment.email === user.email && (
        <>
          <button onClick={() => deleteComment(comment.id)}>Delete</button>
          <button
            onClick={() => {
              setEditingCommentId(comment.id);
              setNewComment({ name: comment.name, body: comment.body }); // הערכים המקוריים
            }}
          >
            Edit
          </button>
          {editingCommentId === comment.id && (
            <div className="editComment">
              <input
                type="text"
                placeholder="New Name"
                value={newComment.name}
                onChange={(e) =>
                  setNewComment({
                    ...newComment,
                    name: e.target.value,
                  })
                }
              />
              <textarea
                placeholder="New Body"
                value={newComment.body}
                onChange={(e) =>
                  setNewComment({
                    ...newComment,
                    body: e.target.value,
                  })
                }
              ></textarea>
              <button onClick={() => handleEditComment(comment.id, postId)}>
                Save
              </button>
              <button onClick={() => setEditingCommentId(null)}>Cancel</button>
            </div>
          )}
        </>
      )}
    </>
  );
}
export default Posts;
