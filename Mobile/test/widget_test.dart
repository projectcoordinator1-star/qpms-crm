import 'package:flutter_test/flutter_test.dart';
import 'package:qpms_mobile/main.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';

void main() {
  testWidgets('mock Field Officer login opens home screen', (tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const QpmsMobileApp());
    await tester.pumpAndSettle();

    expect(find.text('Welcome Back'), findsOneWidget);
    expect(find.text('Sign in'), findsOneWidget);

    await tester.enterText(find.byType(EditableText).at(0), 'bd1@qpms.co.in');
    await tester.enterText(find.byType(EditableText).at(1), '123456');
    await tester.tap(find.text('Sign in'));
    await tester.pump(const Duration(milliseconds: 600));
    await tester.pumpAndSettle();

    expect(find.text('Welcome, Ananya Rao'), findsOneWidget);
    expect(find.text('Total Leads Created'), findsOneWidget);
    expect(find.text('Add Lead'), findsOneWidget);
    expect(find.text('Add New Lead'), findsNothing);
  });
}
