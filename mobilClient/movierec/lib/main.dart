import 'package:flutter/material.dart';
import 'package:movierec/API/mov_reqs.dart';
import 'package:movierec/components/movie_search_bar.dart';
import 'package:movierec/model/search_result.dart';
import 'package:movierec/pages/recommendation_page.dart';
import 'package:movierec/provider/recommendation_provider.dart';
import 'package:provider/provider.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => RecommendationProvider()),
      ],
      child: MaterialApp(
        title: 'Flutter Demo',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        ),
        home: const RecommendationPage(),
      ),
    );
  }
}
