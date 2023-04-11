export const CommentFormatter = (item: any) => {
  const date = new Date(parseInt(item.CreatedAt.N));
  const comment = {
    commentId: item.PK.S.slice(8),
    tweetId: item.Data.S.slice(6),
    userId: item.UserId.S.slice(1),
    username: item.Username.S,
    text: item.Text.S,
    createdAt: date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
  };

  return comment;
};
