import { NavigatorScreenParams } from '@react-navigation/native';
import { NewsArticle, NewsCategory } from './news';

export type BottomTabParamList = {
  Feed: undefined;
  Categories: undefined;
  Videos: undefined;
  Bookmarks: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList>;
  ArticleDetail: { article: NewsArticle };
  CategoryDetail: { category: NewsCategory };
  Search: undefined;
  Login: undefined;
  Signup: undefined;
};
