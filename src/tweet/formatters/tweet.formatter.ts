import { Tweet } from 'src/share/models/tweet.model';

export const TweetFormatter = (item: any): Tweet => {
  const date = new Date(parseInt(item.CreatedAt.N));
  const tweet = {
    tweetId: item.PK.S.slice(6),
    userId: item.Data.S.slice(1),
    username: item.Username.S,
    text: item.Text.S,
    createdAt: date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
  };

  return tweet;
};
