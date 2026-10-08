import { useState } from 'react';

function AdminReviews({ request, searchQuery, reviews, onReviewsChange }) {
    const [filter, setFilter] = useState('all');
    const [error, setError] = useState('');

    async function setReviewVisibility(review, isApproved) {
        setError('');
        try {
            await request(`reviews/${review.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_approved: isApproved }),
            });
            onReviewsChange(reviews.map((currentReview) => (
                currentReview.id === review.id ? { ...currentReview, is_approved: isApproved } : currentReview
            )));
        } catch (updateError) {
            setError(updateError.message || 'Unable to update review visibility.');
        }
    }

    async function deleteReview(review) {
        if (!window.confirm(`Permanently delete this review for "${review.product_name}"?`)) return;
        setError('');
        try {
            await request(`reviews/${review.id}`, { method: 'DELETE' });
            onReviewsChange(reviews.filter((item) => item.id !== review.id));
        } catch (deleteError) {
            setError(deleteError.message || 'Unable to delete review.');
        }
    }

    const query = searchQuery.trim().toLocaleLowerCase();
    const filteredReviews = reviews.filter((review) => (
        (filter === 'all' || (filter === 'approved' ? review.is_approved : !review.is_approved))
        && `${review.product_name} ${review.customer_name} ${review.comment} ${review.rating}`
            .toLocaleLowerCase()
            .includes(query)
    ));

    return (
        <section className="admin-orders-panel admin-management-panel">
            <div className="admin-panel-heading">
                <div><h2>Customer reviews</h2><p>Approve reviews to display them on product pages, or hide and remove them.</p></div>
                <span>{filteredReviews.length} reviews</span>
            </div>
            {error && <p className="admin-error" role="alert">{error}</p>}
            <div className="admin-section-toolbar">
                <select aria-label="Filter reviews by visibility" value={filter} onChange={(event) => setFilter(event.target.value)}>
                    <option value="all">All reviews</option>
                    <option value="approved">Visible</option>
                    <option value="hidden">Hidden</option>
                </select>
            </div>
            {filteredReviews.length ? (
                <div className="admin-table-wrap">
                    <table>
                        <thead><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Review</th><th>Date</th><th>Visibility</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filteredReviews.map((review) => (
                                <tr key={review.id}>
                                    <td>{review.product_name}</td>
                                    <td>{review.customer_name}</td>
                                    <td>{review.rating} / 5</td>
                                    <td className="admin-review-comment">{review.comment || '—'}</td>
                                    <td>{review.created_at ? new Date(review.created_at).toLocaleDateString() : '—'}</td>
                                    <td><span className={review.is_approved ? 'admin-status-approved' : 'admin-status-hidden'}>{review.is_approved ? 'Visible' : 'Hidden'}</span></td>
                                    <td>
                                        <div className="admin-table-actions">
                                            <button className="admin-small-action" type="button" onClick={() => setReviewVisibility(review, !review.is_approved)}>
                                                {review.is_approved ? 'Hide' : 'Approve'}
                                            </button>
                                            <button className="admin-small-action admin-danger-action" type="button" onClick={() => deleteReview(review)}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : <p className="admin-empty-state">{query ? 'No reviews match your search.' : 'No customer reviews yet.'}</p>}
        </section>
    );
}

export default AdminReviews;
