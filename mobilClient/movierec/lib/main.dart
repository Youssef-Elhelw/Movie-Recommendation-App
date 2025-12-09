import 'package:flutter/material.dart';
import 'package:movierec/API/mov_reqs.dart';
import 'package:movierec/components/movie_search_bar.dart';
import 'package:movierec/model/search_result.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      home: const testReq(),
    );
  }
}

class testReq extends StatefulWidget {
  const testReq({super.key});

  @override
  State<testReq> createState() => _testReqState();
}

class _testReqState extends State<testReq> {
  TextEditingController _controller = new TextEditingController();
  late Future<List<SearchResult>> _future;
  String results = "nothing";

  @override
  void initState() {
    _future = Requests.searchFor("movie");
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return MovieSearchBar();

    return Scaffold(
      body: Center(
        child: Column(
          children: [
            TextField(controller: _controller),
            TextButton(
              onPressed: () {
                setState(() {
                  _future = Requests.searchFor(_controller.text);
                });
              },
              child: Text("Request"),
            ),
            FutureBuilder(
              future: _future,
              builder: (context, snapshot) {
                if (!snapshot.hasData) return Text("NO MOBIES");
                List<SearchResult> data = snapshot.data!;
                return Expanded(
                  child: ListView.builder(
                    itemCount: data.length,
                    itemBuilder: (context, index) {
                      return ListTile(
                        title: Text(data[index].title),
                        subtitle: Text(data[index].score.toString()),
                      );
                    },
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
