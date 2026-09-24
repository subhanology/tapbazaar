import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/**
 * Renders a list of comments for a product, including creation, editing, and deletion capabilities.
 * Restricts commenting if the current user is the seller of the product.
 * 
 * @param {Object} props - Component props
 * @param {string} props.productId - The ID of the associated product
 * @param {string} props.sellerId - The ID of the user who owns the product
 * @param {Array} props.comments - Current list of comments
 * @param {Function} props.setComments - State setter function for updating the comments array
 * @returns {JSX.Element} The CommentList component
 */
const CommentList = ({ productId, sellerId, comments, setComments }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const isOwner = user && sellerId && user._id === sellerId;

  /**
   * Submits a new comment to the API and updates the local state.
   * 
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!content.trim()) return;

    try {
      const res = await api.post(`/products/${productId}/comments`, { content });
      setComments((prev) => [res.data.comment, ...prev]);
      setContent('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post comment');
    }
  };

  /**
   * Deletes a specific comment via the API and updates the local state.
   * 
   * @param {string} commentId - The ID of the comment to delete
   */
  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  /**
   * Submits the updated content for an existing comment to the API and updates local state.
   * 
   * @param {React.FormEvent} e - Form submission event
   * @param {string} commentId - The ID of the comment being edited
   */
  const handleEditSubmit = async (e, commentId) => {
    e.preventDefault();
    if (!editContent.trim()) return;

    try {
      const res = await api.put(`/comments/${commentId}`, { content: editContent });
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, content: res.data.comment.content } : c))
      );
      setEditingId(null);
    } catch (err) {
      console.error('Failed to edit comment:', err);
    }
  };

  return (
    <div className="space-y-4">
      {!isOwner && user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 rounded-btn border border-border/60 px-4 py-2 text-sm outline-none focus:shadow-hover"
          />
          <button type="submit" className="rounded-btn bg-ink px-4 py-2 text-sm text-white hover:shadow-hover">
            Post
          </button>
        </form>
      )}
      {isOwner && <p className="text-xs text-ink-secondary">You cannot comment on your own listing.</p>}
      {error && <p className="text-xs text-error">{error}</p>}

      <ul className="space-y-3">
        {comments.map((c) => {
          const isCommentAuthor = user && c.userId?._id === user._id;

          return (
            <li key={c._id} className="rounded-card border border-border/30 p-3">
              <div className="flex items-start justify-between">
                <p className="text-xs font-semibold text-ink">{c.userId?.email}</p>
                
                {isCommentAuthor && (
                  <div className="flex gap-3 text-xs font-medium">
                    <button 
                      onClick={() => { setEditingId(c._id); setEditContent(c.content); }} 
                      className="text-ink hover:underline"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(c._id)} 
                      className="text-error hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {editingId === c._id ? (
                <form onSubmit={(e) => handleEditSubmit(e, c._id)} className="mt-2 flex gap-2">
                  <input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 rounded border border-border/60 px-3 py-1 text-sm outline-none"
                  />
                  <button type="submit" className="rounded bg-ink px-3 py-1 text-xs text-white">Save</button>
                  <button type="button" onClick={() => setEditingId(null)} className="rounded bg-surface px-3 py-1 text-xs text-ink">Cancel</button>
                </form>
              ) : (
                <p className="mt-1 text-sm text-ink-secondary">{c.content}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CommentList;