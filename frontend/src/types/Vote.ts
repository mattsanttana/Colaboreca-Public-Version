export enum voteValues {
  VERY_GOOD = 'very_good',
  GOOD = 'good',
  NORMAL = 'normal',
  BAD = 'bad',
  VERY_BAD = 'very_bad'
}

export interface Vote {
  voteValues: voteValues[];
}
