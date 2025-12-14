import 'package:flutter/material.dart';
import 'package:movierec/model/recommend_result.dart';

class RecommendationProvider extends ChangeNotifier {
  List<RecommendResult> movies = [];

  void setMovies(List<RecommendResult> _movies) {
    movies = _movies;
    notifyListeners();
  }
}
