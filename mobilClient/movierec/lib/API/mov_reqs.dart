import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:movierec/model/recommend_result.dart';
import 'package:movierec/model/search_result.dart';

class Requests {
  static Future<List<SearchResult>> searchFor(String title) async {
    final response = await http.get(
      Uri.parse('http://192.168.1.12:5000/search?q=$title'),
    );

    if (response.statusCode == 200) {
      final List<dynamic> jsonList = jsonDecode(response.body);

      // Convert each JSON map into your model
      return jsonList.map((json) => SearchResult.fromJson(json)).toList();
    } else {
      throw Exception("Failed to load search results");
    }
  }

  static Future<List<RecommendResult>> getRecommendations(String title) async {
    final response = await http.get(
      Uri.parse('http://192.168.1.12:5000/recommendation?title=$title'),
    );

    if (response.statusCode == 200) {
      final List<dynamic> jsonList = jsonDecode(response.body);

      // Convert each JSON map into your model
      return jsonList.map((json) => RecommendResult.fromJson(json)).toList();
    } else {
      throw Exception("Failed to load search results");
    }
  }
}
