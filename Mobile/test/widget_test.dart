import 'package:flutter_test/flutter_test.dart';
import 'package:qpms_mobile/main.dart';

void main() {
  testWidgets('mock Field Officer login opens home screen', (tester) async {
    await tester.pumpWidget(const QpmsMobileApp());

    expect(find.text('Welcome Back'), findsOneWidget);
    expect(find.text('Sign in'), findsOneWidget);

    await tester.tap(find.text('Sign in'));
    await tester.pump(const Duration(milliseconds: 600));
    await tester.pumpAndSettle();

    expect(find.text('Welcome, Field Officer'), findsOneWidget);
    expect(find.text('Total Leads Created'), findsOneWidget);
    expect(find.text('Add Lead'), findsOneWidget);
    expect(find.text('Add New Lead'), findsNothing);
  });
}
