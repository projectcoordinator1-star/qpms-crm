import 'dart:convert';
import 'dart:io';

import 'package:supabase_flutter/supabase_flutter.dart';

class QpmsSupabaseService {
  QpmsSupabaseService._();

  static const String _url = String.fromEnvironment('SUPABASE_URL');
  static const String _anonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
  static const String _apiBaseUrl = String.fromEnvironment('QPMS_API_URL');
  static String get apiBaseUrl {
    if (_apiBaseUrl.isNotEmpty) return _apiBaseUrl;
    return Platform.isAndroid ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
  }

  static bool get isConfigured => _url.isNotEmpty && _anonKey.isNotEmpty;

  static SupabaseClient? get client {
    if (!isConfigured) return null;
    return Supabase.instance.client;
  }

  static Future<void> initialize() async {
    if (!isConfigured) return;
    await Supabase.initialize(
      url: _url.replaceAll(RegExp(r'/rest/v1/?$'), ''),
      anonKey: _anonKey,
    );
  }

  static Future<String?> createLead({
    required Map<String, dynamic> lead,
    required List<Map<String, dynamic>> contacts,
  }) async {
    final supabase = client;
    if (supabase == null) return null;

    final created = await supabase
        .from('leads')
        .insert(lead)
        .select('id')
        .single();
    final leadId = created['id'] as String;

    if (contacts.isNotEmpty) {
      await supabase
          .from('lead_contacts')
          .insert(
            contacts.map((contact) => {...contact, 'lead_id': leadId}).toList(),
          );
    }

    await logActivity(
      leadId: leadId,
      type: 'Lead Created',
      message: 'Lead Created from mobile app',
    );
    return leadId;
  }

  static Future<void> saveLeadMom({
    required String leadId,
    required Map<String, dynamic> mom,
    required bool sent,
  }) async {
    final supabase = client;
    if (supabase == null) return;

    await supabase.from('lead_mom').upsert({
      ...mom,
      'lead_id': leadId,
      'mom_status': sent ? 'Sent' : 'Draft',
      'sent_at': sent ? DateTime.now().toIso8601String() : null,
    }, onConflict: 'lead_id');
  }

  static Future<void> deleteLead(String leadId) async {
    final supabase = client;
    if (supabase == null) return;

    await logActivity(type: 'Lead Deleted', message: 'Lead Deleted');
    await supabase.from('site_assessments').delete().eq('lead_id', leadId);
    await supabase.from('site_visits').delete().eq('lead_id', leadId);
    await supabase.from('lead_mom').delete().eq('lead_id', leadId);
    await supabase.from('lead_contacts').delete().eq('lead_id', leadId);
    await supabase.from('leads').delete().eq('id', leadId);
  }

  static Future<String?> createSiteVisit(Map<String, dynamic> visit) async {
    final supabase = client;
    if (supabase == null) return null;
    final row = await supabase
        .from('site_visits')
        .upsert(visit, onConflict: 'lead_id')
        .select('id')
        .single();
    return row['id'] as String?;
  }

  static Future<void> saveAssessment(Map<String, dynamic> assessment) async {
    final supabase = client;
    if (supabase == null) return;
    await supabase
        .from('site_assessments')
        .upsert(assessment, onConflict: 'site_visit_id');
  }

  static Future<String?> uploadSiteImage({
    required String siteVisitId,
    required String category,
    required File file,
    String? assessmentId,
    String? uploadedBy,
  }) async {
    final supabase = client;
    if (supabase == null) return null;

    final fileName = file.path.split(Platform.pathSeparator).last;
    final path =
        '$siteVisitId/$category/${DateTime.now().millisecondsSinceEpoch}-$fileName';
    await supabase.storage.from('site-survey-images').upload(path, file);
    final publicUrl = supabase.storage
        .from('site-survey-images')
        .getPublicUrl(path);
    await supabase.from('site_images').insert({
      'site_visit_id': siteVisitId,
      'assessment_id': assessmentId,
      'image_category': category,
      'image_url': publicUrl,
      'file_name': fileName,
      'uploaded_by': uploadedBy,
    });
    return publicUrl;
  }

  static Future<void> logActivity({
    String? leadId,
    String? siteVisitId,
    required String type,
    required String message,
    String? createdBy,
  }) async {
    final supabase = client;
    if (supabase == null) return;
    await supabase.from('activity_logs').insert({
      'lead_id': leadId,
      'site_visit_id': siteVisitId,
      'activity_type': type,
      'activity_message': message,
      'created_by': createdBy,
    });
  }

  static Future<void> sendLeadMomEmail(Map<String, dynamic> payload) async {
    await _postMail('/send-lead-mom', payload);
  }

  static Future<void> sendSiteVisitMomEmail(
    Map<String, dynamic> payload,
  ) async {
    await _postMail('/send-sitevisit-mom', payload);
  }

  static Future<void> _postMail(
    String path,
    Map<String, dynamic> payload,
  ) async {
    final client = HttpClient();
    try {
      final uri = Uri.parse('$apiBaseUrl$path');
      final request = await client.postUrl(uri);
      request.headers.contentType = ContentType.json;
      request.write(jsonEncode(payload));
      final response = await request.close();
      if (response.statusCode < 200 || response.statusCode >= 300) {
        final body = await response.transform(utf8.decoder).join();
        throw HttpException('Mail API failed: ${response.statusCode} $body');
      }
    } finally {
      client.close();
    }
  }
}
