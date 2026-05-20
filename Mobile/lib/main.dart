import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'services/supabase_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await QpmsSupabaseService.initialize();
  runApp(const QpmsMobileApp());
}

const Color qpms50 = Color(0xFFEEF4FF);
const Color qpms100 = Color(0xFFDCE8FF);
const Color qpms300 = Color(0xFF85ADFF);
const Color qpms500 = Color(0xFF2E5FE7);
const Color qpms600 = Color(0xFF2444A4);
const Color qpms700 = Color(0xFF213D92);
const Color qpms900 = Color(0xFF1F315F);
const Color slate950 = Color(0xFF172033);
const Color slate500 = Color(0xFF64748B);
const Color appBackground = Color(0xFFF5F7FB);
const String mobileSessionUserKey = 'qpms_mobile_session_user_id';

const List<String> leadSources = [
  'Direct Visit',
  'Referral',
  'LinkedIn',
  'Website',
  'Campaign',
  'Email',
  'Existing Client Reference',
];

const List<String> leadPriorities = ['Low', 'Medium', 'High', 'Urgent'];
const List<String> industryOptions = [
  'Healthcare',
  'Airport',
  'Commercial',
  'Retail',
  'Hospitality',
  'Education',
  'Industrial',
  'Corporate Office',
];
const List<String> stateOptions = [
  'Tamil Nadu',
  'Kerala',
  'Karnataka',
  'Telangana',
  'Andhra Pradesh - 1',
  'Andhra Pradesh - 2',
];
const List<String> leadStatusOptions = [
  'New Lead',
  'Lead MOM Sent',
  'Site Visit Scheduled',
  'Commercial Review',
  'Proposal Sent',
  'Converted',
  'Lost',
];
const List<String> marginTypeOptions = [
  'Percentage',
  'Fixed Value',
  'Not Finalized',
];
const List<String> leadServiceScopes = [
  'Hard Services MEP',
  'Soft Services Housekeeping',
  'Security Services',
  'Waste Management',
  'Landscaping Irrigation',
  'Pest Control',
  'Helpdesk CAFM',
  'Energy Management',
  'Sustainability ESG',
  'Other Services',
];
const String leadMomScheduleError =
    'Please provide either Site Visit Schedule Date & Time or Next Follow-up Date before sending the Minutes of Meeting.';

const List<MockUser> mockUsers = [
  MockUser(
    id: 'admin',
    name: 'Admin',
    email: 'admin@qpms.co.in',
    role: 'Admin',
    password: '123456',
  ),
  MockUser(
    id: 'bd-head',
    name: 'BD Head',
    email: 'bdhead@qpms.co.in',
    role: 'BD Head',
    password: '123456',
  ),
  MockUser(
    id: 'bd-1',
    name: 'Ananya Rao',
    email: 'bd1@qpms.co.in',
    role: 'BD Executive',
    password: '123456',
  ),
  MockUser(
    id: 'bd-2',
    name: 'Karthik Menon',
    email: 'bd2@qpms.co.in',
    role: 'BD Executive',
    password: '123456',
  ),
  MockUser(
    id: 'operations-1',
    name: 'Operations Reviewer 1',
    email: 'operations1@qpms.co.in',
    role: 'Operations Team',
    password: '123456',
  ),
  MockUser(
    id: 'coordinator-1',
    name: 'Coordinator 1',
    email: 'coordinator1@qpms.co.in',
    role: 'Coordinator',
    password: '123456',
  ),
  MockUser(
    id: 'commercial-1',
    name: 'Commercial Reviewer 1',
    email: 'commercial1@qpms.co.in',
    role: 'Commercial Reviewer',
    password: '123456',
  ),
  MockUser(
    id: 'commercial-2',
    name: 'Commercial Reviewer 2',
    email: 'commercial2@qpms.co.in',
    role: 'Commercial Reviewer',
    password: '123456',
  ),
  MockUser(
    id: 'finance-1',
    name: 'Finance Reviewer 1',
    email: 'finance1@qpms.co.in',
    role: 'Finance Reviewer',
    password: '123456',
  ),
  MockUser(
    id: 'finance-2',
    name: 'Finance Reviewer 2',
    email: 'finance2@qpms.co.in',
    role: 'Finance Reviewer',
    password: '123456',
  ),
  MockUser(
    id: 'hr-1',
    name: 'HR Reviewer 1',
    email: 'hr1@qpms.co.in',
    role: 'HR Reviewer',
    password: '123456',
  ),
  MockUser(
    id: 'hr-2',
    name: 'HR Reviewer 2',
    email: 'hr2@qpms.co.in',
    role: 'HR Reviewer',
    password: '123456',
  ),
  MockUser(
    id: 'bd-3',
    name: 'Nisha Iyer',
    email: 'bd3@qpms.co.in',
    role: 'BD Executive',
    password: '123456',
  ),
];

class MockUser {
  const MockUser({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.password,
  });

  final String id;
  final String name;
  final String email;
  final String role;
  final String password;
}

MockUser? findMockUserById(String? id) {
  if (id == null) return null;
  for (final user in mockUsers) {
    if (user.id == id) return user;
  }
  return null;
}

class QpmsMobileApp extends StatefulWidget {
  const QpmsMobileApp({super.key});

  @override
  State<QpmsMobileApp> createState() => _QpmsMobileAppState();
}

class _QpmsMobileAppState extends State<QpmsMobileApp> {
  final GlobalKey<NavigatorState> _navigatorKey = GlobalKey<NavigatorState>();
  bool _sessionLoaded = false;
  MockUser? _currentUser;
  final List<Lead> _leads = [
    Lead(
      id: 'QPMS-001',
      clientName: 'Acme Facilities Pvt Ltd',
      industryType: 'Corporate Office',
      leadSource: 'Direct Visit',
      siteLocation: 'IT Park, Phase 2',
      state: 'Karnataka',
      city: 'Bengaluru',
      contactPersons: const [
        ContactPerson(
          id: 'contact-001-a',
          name: 'Ravi Menon',
          designation: 'Admin Manager',
          phone: '9876543210',
          email: 'ravi.menon@example.com',
          isPrimary: true,
        ),
        ContactPerson(
          id: 'contact-001-b',
          name: 'Sneha Iyer',
          designation: 'Procurement',
          phone: '9876543211',
          email: 'sneha.iyer@example.com',
        ),
      ],
      createdByUserId: 'bd-1',
      createdByName: 'Ananya Rao',
      assignedBdExecutive: 'Ananya Rao',
      assignedBdEmail: 'bd1@qpms.co.in',
      leadPriority: 'High',
      remarks:
          'Initial visit completed. Client asked for a follow-up discussion with operations.',
      serviceScope: const ['Soft Services Housekeeping', 'Security Services'],
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
    ),
  ];

  void _addLead(Lead lead) {
    setState(() {
      _leads.insert(0, lead);
    });
    QpmsSupabaseService.createLead(
          lead: lead.toSupabaseLeadMap(),
          contacts: lead.toSupabaseContactMaps(),
        )
        .then((remoteId) {
          if (remoteId != null) {
            setState(() => lead.remoteLeadId = remoteId);
          }
        })
        .catchError((Object error) {
          debugPrint('Supabase lead insert failed: $error');
          return null;
        });
  }

  @override
  void initState() {
    super.initState();
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    final prefs = await SharedPreferences.getInstance();
    final savedUser = findMockUserById(prefs.getString(mobileSessionUserKey));
    if (!mounted) return;
    setState(() {
      _currentUser = savedUser;
      _sessionLoaded = true;
    });
  }

  Future<void> _handleLogin(MockUser user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(mobileSessionUserKey, user.id);
    if (!mounted) return;
    setState(() => _currentUser = user);
  }

  Future<void> _handleLogout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(mobileSessionUserKey);
    if (!mounted) return;
    setState(() => _currentUser = null);
    _navigatorKey.currentState?.popUntil((route) => route.isFirst);
  }

  void _deleteLead(Lead lead) {
    setState(() => _leads.removeWhere((item) => item.id == lead.id));
    final remoteLeadId = lead.remoteLeadId;
    if (remoteLeadId != null) {
      QpmsSupabaseService.deleteLead(remoteLeadId).catchError((Object error) {
        debugPrint('Supabase lead delete failed: $error');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_sessionLoaded) {
      return MaterialApp(
        title: 'QPMS Mobile',
        debugShowCheckedModeBanner: false,
        home: const Scaffold(
          body: Center(child: CircularProgressIndicator(color: qpms600)),
        ),
      );
    }

    return MaterialApp(
      title: 'QPMS Mobile',
      debugShowCheckedModeBanner: false,
      navigatorKey: _navigatorKey,
      theme: ThemeData(
        useMaterial3: true,
        fontFamily: 'Inter',
        scaffoldBackgroundColor: appBackground,
        colorScheme: ColorScheme.fromSeed(
          seedColor: qpms600,
          primary: qpms600,
          secondary: qpms500,
          surface: Colors.white,
        ),
        navigationBarTheme: NavigationBarThemeData(
          backgroundColor: Colors.white,
          indicatorColor: qpms100,
          labelTextStyle: WidgetStateProperty.resolveWith(
            (states) => TextStyle(
              color: states.contains(WidgetState.selected) ? qpms700 : slate500,
              fontSize: 12,
              fontWeight: FontWeight.w800,
            ),
          ),
          iconTheme: WidgetStateProperty.resolveWith(
            (states) => IconThemeData(
              color: states.contains(WidgetState.selected) ? qpms700 : slate500,
              size: 22,
            ),
          ),
        ),
        textTheme: const TextTheme(
          headlineLarge: TextStyle(
            color: slate950,
            fontWeight: FontWeight.w800,
            letterSpacing: 0,
          ),
          headlineSmall: TextStyle(
            color: slate950,
            fontWeight: FontWeight.w800,
            letterSpacing: 0,
          ),
          titleLarge: TextStyle(
            color: slate950,
            fontWeight: FontWeight.w800,
            letterSpacing: 0,
          ),
          titleMedium: TextStyle(
            color: slate950,
            fontWeight: FontWeight.w700,
            letterSpacing: 0,
          ),
          bodyMedium: TextStyle(color: slate950, height: 1.45),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 16,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(18),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(18),
            borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(18),
            borderSide: const BorderSide(color: qpms300, width: 1.4),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(18),
            borderSide: const BorderSide(color: Color(0xFFFB7185)),
          ),
          labelStyle: const TextStyle(
            color: Color(0xFF475569),
            fontWeight: FontWeight.w600,
          ),
          hintStyle: const TextStyle(color: Color(0xFF94A3B8)),
        ),
      ),
      home: _currentUser == null
          ? LoginScreen(onLogin: _handleLogin)
          : CrmMobileHomeScreen(
              leads: _leads,
              onAddLead: _addLead,
              onDeleteLead: _deleteLead,
              onLogout: _handleLogout,
              user: _currentUser!,
            ),
    );
  }
}

class Lead {
  Lead({
    required this.id,
    required this.clientName,
    required this.industryType,
    required this.leadSource,
    required this.siteLocation,
    required this.state,
    required this.city,
    required this.contactPersons,
    required this.createdByUserId,
    required this.createdByName,
    required this.assignedBdExecutive,
    required this.assignedBdEmail,
    required this.leadPriority,
    required this.remarks,
    required this.serviceScope,
    required this.createdAt,
    this.status = 'New Lead',
    this.scheduledVisitDate,
    this.scheduledVisitTime,
    this.siteVisitRemarks = '',
    this.siteMomStatus = 'Pending',
    this.remoteLeadId,
    this.remoteSiteVisitId,
  });

  final String id;
  final String clientName;
  final String industryType;
  final String leadSource;
  final String siteLocation;
  final String state;
  final String city;
  final List<ContactPerson> contactPersons;
  final String createdByUserId;
  final String createdByName;
  final String assignedBdExecutive;
  final String assignedBdEmail;
  final String leadPriority;
  final String remarks;
  final List<String> serviceScope;
  String status;
  final DateTime createdAt;
  DateTime? scheduledVisitDate;
  String? scheduledVisitTime;
  String siteVisitRemarks;
  String siteMomStatus;
  String? remoteLeadId;
  String? remoteSiteVisitId;

  ContactPerson get primaryContact {
    return contactPersons.firstWhere(
      (contact) => contact.isPrimary,
      orElse: () => contactPersons.first,
    );
  }

  String get contactPersonName => primaryContact.name;
  String get contactPersonDesignation => primaryContact.designation;
  String get contactNumber => primaryContact.phone;
  String get emailId => primaryContact.email;

  Map<String, dynamic> toSupabaseLeadMap() {
    return {
      'client_name': clientName,
      'industry_type': industryType,
      'lead_source': leadSource,
      'site_location': siteLocation,
      'state': state,
      'city': city,
      'lead_priority': leadPriority,
      'service_scope': serviceScope,
      'remarks': remarks,
      'assigned_bd_executive': assignedBdExecutive,
      'assigned_bd_email': assignedBdEmail,
      'created_by_user_id': createdByUserId,
      'created_by_name': createdByName,
      'lead_stage': status,
      'status': 'Active',
    };
  }

  List<Map<String, dynamic>> toSupabaseContactMaps() {
    return contactPersons
        .map(
          (contact) => {
            'contact_person_name': contact.name,
            'contact_person_designation': contact.designation,
            'contact_number': contact.phone,
            'email_id': contact.email,
            'is_primary': contact.isPrimary,
          },
        )
        .toList();
  }
}

class MobileModule {
  const MobileModule({required this.title, required this.icon});

  final String title;
  final IconData icon;
}

const List<MobileModule> mobileModules = [
  MobileModule(title: 'Dashboard', icon: Icons.dashboard_outlined),
  MobileModule(title: 'Lead Management', icon: Icons.business_center_outlined),
  MobileModule(
    title: 'Site Visit & Estimation',
    icon: Icons.fact_check_outlined,
  ),
  MobileModule(title: 'Settings', icon: Icons.settings_outlined),
];

class ContactPerson {
  const ContactPerson({
    required this.id,
    required this.name,
    required this.designation,
    required this.phone,
    required this.email,
    this.isPrimary = false,
  });

  final String id;
  final String name;
  final String designation;
  final String phone;
  final String email;
  final bool isPrimary;

  ContactPerson copyWith({
    String? id,
    String? name,
    String? designation,
    String? phone,
    String? email,
    bool? isPrimary,
  }) {
    return ContactPerson(
      id: id ?? this.id,
      name: name ?? this.name,
      designation: designation ?? this.designation,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      isPrimary: isPrimary ?? this.isPrimary,
    );
  }
}

Route<T> fadeRoute<T>(Widget page) {
  return PageRouteBuilder<T>(
    transitionDuration: const Duration(milliseconds: 280),
    reverseTransitionDuration: const Duration(milliseconds: 210),
    pageBuilder: (context, animation, secondaryAnimation) => page,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      final curved = CurvedAnimation(
        parent: animation,
        curve: Curves.easeOutQuart,
        reverseCurve: Curves.easeInCubic,
      );
      return FadeTransition(
        opacity: curved,
        child: SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0, 0.035),
            end: Offset.zero,
          ).animate(curved),
          child: child,
        ),
      );
    },
  );
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.onLogin});

  final ValueChanged<MockUser> onLogin;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _showPassword = false;
  bool _isSubmitting = false;
  String? _error;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _isSubmitting = true;
      _error = null;
    });

    await Future<void>.delayed(const Duration(milliseconds: 550));

    final email = _emailController.text.trim().toLowerCase();
    final password = _passwordController.text;

    final matchedUser = mockUsers.where(
      (user) => user.email == email && user.password == password,
    );

    if (matchedUser.isNotEmpty) {
      widget.onLogin(matchedUser.first);
      return;
    }

    setState(() {
      _isSubmitting = false;
      _error = 'Incorrect username or password.';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: RadialGradient(
            center: Alignment(0, -0.35),
            radius: 1.2,
            colors: [
              Color(0xFFFFFFFF),
              Color(0xFFDCE8FF),
              Color(0xFF4F82FB),
              Color(0xFF101A4D),
            ],
            stops: [0, 0.34, 0.68, 1],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 28),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 460),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const QpmsBrandMark(),
                    const SizedBox(height: 28),
                    AnimatedScale(
                      scale: _isSubmitting ? 0.985 : 1,
                      duration: const Duration(milliseconds: 180),
                      child: PremiumCard(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Align(
                              child: PillBadge(
                                text: 'QPMS CRM MOBILE',
                                icon: Icons.business_center_outlined,
                              ),
                            ),
                            const SizedBox(height: 24),
                            Text(
                              'Welcome Back',
                              textAlign: TextAlign.center,
                              style: Theme.of(
                                context,
                              ).textTheme.headlineLarge?.copyWith(fontSize: 34),
                            ),
                            const SizedBox(height: 10),
                            const Text(
                              'Sign in to manage leads, MOMs, site visits, reviews, and approvals.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: slate500,
                                fontWeight: FontWeight.w600,
                                height: 1.45,
                              ),
                            ),
                            const SizedBox(height: 28),
                            TextField(
                              controller: _emailController,
                              keyboardType: TextInputType.emailAddress,
                              textInputAction: TextInputAction.next,
                              decoration: const InputDecoration(
                                labelText: 'Email',
                                prefixIcon: Icon(Icons.mail_outline),
                              ),
                            ),
                            const SizedBox(height: 16),
                            TextField(
                              controller: _passwordController,
                              obscureText: !_showPassword,
                              onSubmitted: (_) => _submit(),
                              decoration: InputDecoration(
                                labelText: 'Password',
                                prefixIcon: const Icon(Icons.lock_outline),
                                suffixIcon: IconButton(
                                  onPressed: () => setState(
                                    () => _showPassword = !_showPassword,
                                  ),
                                  icon: Icon(
                                    _showPassword
                                        ? Icons.visibility_off_outlined
                                        : Icons.visibility_outlined,
                                  ),
                                ),
                              ),
                            ),
                            if (_error != null) ...[
                              const SizedBox(height: 14),
                              ErrorNotice(message: _error!),
                            ],
                            const SizedBox(height: 22),
                            FilledButton.icon(
                              onPressed: _isSubmitting ? null : _submit,
                              icon: _isSubmitting
                                  ? const SizedBox(
                                      width: 18,
                                      height: 18,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white,
                                      ),
                                    )
                                  : const Icon(Icons.arrow_forward_rounded),
                              label: Text(
                                _isSubmitting ? 'Verifying access' : 'Sign in',
                              ),
                              style: FilledButton.styleFrom(
                                backgroundColor: qpms600,
                                foregroundColor: Colors.white,
                                minimumSize: const Size.fromHeight(52),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(18),
                                ),
                                textStyle: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 15,
                                ),
                                elevation: 9,
                                shadowColor: qpms600.withValues(alpha: 0.26),
                              ),
                            ),
                            const SizedBox(height: 18),
                            const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.shield_outlined,
                                  size: 17,
                                  color: Color(0xFF059669),
                                ),
                                SizedBox(width: 8),
                                Text(
                                  'Enterprise CRM mobile access',
                                  style: TextStyle(
                                    color: slate500,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class CrmMobileHomeScreen extends StatefulWidget {
  const CrmMobileHomeScreen({
    super.key,
    required this.leads,
    required this.onAddLead,
    required this.onDeleteLead,
    required this.onLogout,
    required this.user,
  });

  final List<Lead> leads;
  final ValueChanged<Lead> onAddLead;
  final ValueChanged<Lead> onDeleteLead;
  final VoidCallback onLogout;
  final MockUser user;

  @override
  State<CrmMobileHomeScreen> createState() => _CrmMobileHomeScreenState();
}

class _CrmMobileHomeScreenState extends State<CrmMobileHomeScreen> {
  int _selectedIndex = 0;

  List<Lead> get _visibleLeads {
    if (widget.user.role == 'Admin' || widget.user.role == 'BD Head') {
      return widget.leads;
    }
    return widget.leads
        .where((lead) => lead.assignedBdEmail == widget.user.email)
        .toList();
  }

  int get _momPending =>
      _visibleLeads.where((lead) => lead.status == 'New Lead').length;

  int get _siteVisitPending => _visibleLeads
      .where((lead) => lead.status == 'Site Visit Scheduled')
      .length;

  List<Lead> get _siteVisitLeads => _visibleLeads
      .where((lead) => lead.status == 'Site Visit Scheduled')
      .toList();

  List<Lead> get _momDraftLeads => _visibleLeads
      .where(
        (lead) => lead.status == 'New Lead' || lead.status == 'Lead MOM Sent',
      )
      .toList();

  Future<void> _openAddLead() async {
    await Navigator.of(context).push(
      fadeRoute<void>(
        AddLeadScreen(
          leadCount: widget.leads.length,
          user: widget.user,
          onLeadCreated: (lead) {
            widget.onAddLead(lead);
            setState(() {});
          },
        ),
      ),
    );
  }

  Future<void> _openLeadDetail(Lead lead) async {
    await Navigator.of(context).push(
      fadeRoute<void>(
        LeadDetailScreen(
          lead: lead,
          onDelete: () {
            widget.onDeleteLead(lead);
            Navigator.of(context).pop();
          },
        ),
      ),
    );
    setState(() {});
  }

  Future<void> _openSiteVisit(Lead lead) async {
    await Navigator.of(
      context,
    ).push(fadeRoute<void>(SiteVisitAssessmentScreen(lead: lead)));
    setState(() {});
  }

  Widget _moduleBody(List<Lead> visibleLeads) {
    switch (_selectedIndex) {
      case 0:
        return _dashboardBody(visibleLeads);
      case 1:
        return _leadListBody(visibleLeads, 'Lead Management');
      case 2:
        return _siteVisitBody();
      case 3:
        return _leadListBody(_momDraftLeads, 'MOM Draft');
      case 4:
        return const SliverToBoxAdapter(
          child: ModulePlaceholderCard(
            title: 'Commercial Review',
            message:
                'Commercial review records will appear here after site assessment submission.',
            icon: Icons.price_check_outlined,
          ),
        );
      case 5:
        return const SliverToBoxAdapter(
          child: ModulePlaceholderCard(
            title: 'Approval Workflow',
            message:
                'Approval requests and pending leadership actions will be listed here.',
            icon: Icons.verified_outlined,
          ),
        );
      case 6:
        return SliverToBoxAdapter(
          child: SettingsPanel(userRole: widget.user.role),
        );
      default:
        return _dashboardBody(visibleLeads);
    }
  }

  Widget _dashboardBody(List<Lead> visibleLeads) {
    return SliverList.list(
      children: [
        const SectionTitle(title: 'Operational Snapshot'),
        const SizedBox(height: 12),
        UpcomingSiteVisitsCard(leads: _siteVisitLeads),
        const SizedBox(height: 14),
        SectionTitle(
          title: 'Recent Leads',
          actionLabel: 'View all',
          onAction: () => setState(() => _selectedIndex = 1),
        ),
        const SizedBox(height: 12),
        if (visibleLeads.isEmpty)
          const EmptyLeadsCard()
        else
          ...visibleLeads
              .take(3)
              .map(
                (lead) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: LeadListTile(
                    lead: lead,
                    onTap: () => _openLeadDetail(lead),
                  ),
                ),
              ),
      ],
    );
  }

  Widget _leadListBody(List<Lead> leads, String title) {
    return SliverList.builder(
      itemCount: leads.isEmpty ? 2 : leads.length + 1,
      itemBuilder: (context, index) {
        if (index == 0) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: SectionTitle(title: title),
          );
        }
        if (leads.isEmpty) return const EmptyLeadsCard();
        final lead = leads[index - 1];
        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: LeadListTile(lead: lead, onTap: () => _openLeadDetail(lead)),
        );
      },
    );
  }

  Widget _siteVisitBody() {
    return SliverList.list(
      children: [
        const SectionTitle(title: 'Site Visit & Estimation'),
        const SizedBox(height: 12),
        UpcomingSiteVisitsCard(leads: _siteVisitLeads),
        const SizedBox(height: 14),
        if (_siteVisitLeads.isEmpty)
          const ModulePlaceholderCard(
            title: 'No site visits scheduled',
            message:
                'Send a Lead MOM with site visit date and time to move leads into this queue.',
            icon: Icons.event_busy_outlined,
          )
        else
          ..._siteVisitLeads.map(
            (lead) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: LeadListTile(
                lead: lead,
                onTap: () => _openSiteVisit(lead),
              ),
            ),
          ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final visibleLeads = _visibleLeads;
    final activeModule = mobileModules[_selectedIndex];

    return Scaffold(
      drawer: QpmsNavigationDrawer(
        selectedIndex: _selectedIndex,
        user: widget.user,
        onSelect: (index) => setState(() => _selectedIndex = index),
        onLogout: widget.onLogout,
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFF8FBFF), appBackground],
          ),
        ),
        child: SafeArea(
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: HomeHeader(
                  title: activeModule.title,
                  totalLeads: visibleLeads.length,
                  momPending: _momPending,
                  siteVisitPending: _siteVisitPending,
                  user: widget.user,
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(18, 6, 18, 92),
                sliver: _moduleBody(visibleLeads),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openAddLead,
        backgroundColor: qpms600,
        foregroundColor: Colors.white,
        elevation: 8,
        icon: const Icon(Icons.add_rounded),
        label: const Text(
          'Add Lead',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      bottomNavigationBar: NavigationBar(
        height: 68,
        elevation: 10,
        shadowColor: qpms600.withValues(alpha: 0.10),
        selectedIndex: _selectedIndex > 2 ? 0 : _selectedIndex,
        onDestinationSelected: (index) =>
            setState(() => _selectedIndex = index),
        backgroundColor: Colors.white,
        indicatorColor: qpms100,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.list_alt_outlined),
            selectedIcon: Icon(Icons.list_alt),
            label: 'Leads',
          ),
          NavigationDestination(
            icon: Icon(Icons.fact_check_outlined),
            selectedIcon: Icon(Icons.fact_check),
            label: 'Sites',
          ),
        ],
      ),
    );
  }
}

class QpmsNavigationDrawer extends StatelessWidget {
  const QpmsNavigationDrawer({
    super.key,
    required this.selectedIndex,
    required this.user,
    required this.onSelect,
    required this.onLogout,
  });

  final int selectedIndex;
  final MockUser user;
  final ValueChanged<int> onSelect;
  final VoidCallback onLogout;

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: Colors.white,
      child: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 18, 18, 12),
              child: Row(
                children: [
                  const QpmsLogoBox(size: 42),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'QPMS CRM Mobile',
                          style: TextStyle(
                            color: qpms700,
                            fontWeight: FontWeight.w900,
                            fontSize: 17,
                          ),
                        ),
                        Text(
                          user.role,
                          style: const TextStyle(
                            color: slate500,
                            fontWeight: FontWeight.w700,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.fromLTRB(10, 12, 10, 12),
                itemCount: mobileModules.length,
                itemBuilder: (context, index) {
                  final module = mobileModules[index];
                  final selected = selectedIndex == index;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: ListTile(
                      selected: selected,
                      selectedTileColor: qpms50,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      leading: Icon(
                        module.icon,
                        color: selected ? qpms700 : slate500,
                      ),
                      title: Text(
                        module.title,
                        style: TextStyle(
                          color: selected ? qpms700 : slate950,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      onTap: () {
                        Navigator.of(context).pop();
                        onSelect(index);
                      },
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: OutlinedButton.icon(
                onPressed: () {
                  Navigator.of(context).pop();
                  onLogout();
                },
                icon: const Icon(Icons.logout_rounded),
                label: const Text('Logout'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFFE11D48),
                  minimumSize: const Size.fromHeight(48),
                  side: const BorderSide(color: Color(0xFFFECACA)),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  textStyle: const TextStyle(fontWeight: FontWeight.w900),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ModulePlaceholderCard extends StatelessWidget {
  const ModulePlaceholderCard({
    super.key,
    required this.title,
    required this.message,
    required this.icon,
  });

  final String title;
  final String message;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return PremiumCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        children: [
          Icon(icon, color: qpms600, size: 34),
          const SizedBox(height: 10),
          Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
          ),
          const SizedBox(height: 6),
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: slate500,
              fontWeight: FontWeight.w700,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

class SettingsPanel extends StatelessWidget {
  const SettingsPanel({super.key, required this.userRole});

  final String userRole;

  @override
  Widget build(BuildContext context) {
    return const ModulePlaceholderCard(
      title: 'Settings',
      message:
          'Mobile CRM preferences and account controls are available from the navigation drawer.',
      icon: Icons.settings_outlined,
    );
  }
}

class HomeHeader extends StatelessWidget {
  const HomeHeader({
    super.key,
    required this.title,
    required this.totalLeads,
    required this.momPending,
    required this.siteVisitPending,
    required this.user,
  });

  final String title;
  final int totalLeads;
  final int momPending;
  final int siteVisitPending;
  final MockUser user;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 14, 16, 12),
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF16235B), qpms600, Color(0xFF5F8CFF)],
        ),
        boxShadow: [
          BoxShadow(
            color: qpms600.withValues(alpha: 0.20),
            blurRadius: 28,
            offset: const Offset(0, 14),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const QpmsLogoBox(size: 42),
              const SizedBox(width: 10),
              const Expanded(
                child: Text(
                  'QPMS CRM Mobile',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              const Spacer(),
              Builder(
                builder: (context) => IconButton.filledTonal(
                  tooltip: 'Open navigation',
                  onPressed: () => Scaffold.of(context).openDrawer(),
                  style: IconButton.styleFrom(
                    backgroundColor: Colors.white.withValues(alpha: 0.16),
                    foregroundColor: Colors.white,
                  ),
                  icon: const Icon(Icons.menu_rounded),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            title,
            style: TextStyle(
              color: Colors.white,
              fontSize: 23,
              fontWeight: FontWeight.w900,
              letterSpacing: 0,
            ),
          ),
          const SizedBox(height: 7),
          Text(
            'Welcome, ${user.name}. Manage CRM operations from mobile.',
            style: TextStyle(
              color: Color(0xDDEEF4FF),
              fontWeight: FontWeight.w600,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: MetricCard(
                  label: 'Total Leads Created',
                  value: '$totalLeads',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: MetricCard(
                  label: 'Lead MOM Pending',
                  value: '$momPending',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: MetricCard(
                  label: 'Site Visit Scheduled',
                  value: '$siteVisitPending',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class AddLeadScreen extends StatefulWidget {
  const AddLeadScreen({
    super.key,
    required this.leadCount,
    required this.onLeadCreated,
    required this.user,
  });

  final int leadCount;
  final ValueChanged<Lead> onLeadCreated;
  final MockUser user;

  @override
  State<AddLeadScreen> createState() => _AddLeadScreenState();
}

class _ContactFormState {
  _ContactFormState({this.isPrimary = false})
    : id = 'contact-${DateTime.now().microsecondsSinceEpoch}';

  final String id;
  final TextEditingController name = TextEditingController();
  final TextEditingController designation = TextEditingController();
  final TextEditingController phone = TextEditingController();
  final TextEditingController email = TextEditingController();
  bool isPrimary;

  void dispose() {
    name.dispose();
    designation.dispose();
    phone.dispose();
    email.dispose();
  }

  ContactPerson toContact() {
    return ContactPerson(
      id: id,
      name: name.text.trim(),
      designation: designation.text.trim(),
      phone: phone.text.trim(),
      email: email.text.trim(),
      isPrimary: isPrimary,
    );
  }
}

class _AddLeadScreenState extends State<AddLeadScreen> {
  final _formKey = GlobalKey<FormState>();
  final _clientName = TextEditingController();
  final _siteLocation = TextEditingController();
  final _city = TextEditingController();
  final _remarks = TextEditingController();
  final List<_ContactFormState> _contacts = [
    _ContactFormState(isPrimary: true),
  ];
  final Set<String> _serviceScope = <String>{};

  String _industryType = industryOptions.first;
  String _state = stateOptions.first;
  String _leadSource = leadSources.first;
  String _priority = 'Medium';
  String _assignedBdExecutive = '';
  String _assignedBdEmail = '';
  String _status = 'New Lead';

  @override
  void initState() {
    super.initState();
    if (widget.user.role == 'BD Executive') {
      _assignedBdExecutive = widget.user.name;
      _assignedBdEmail = widget.user.email;
    } else {
      final firstBd = mockUsers.firstWhere(
        (user) => user.role == 'BD Executive',
      );
      _assignedBdExecutive = firstBd.name;
      _assignedBdEmail = firstBd.email;
    }
  }

  @override
  void dispose() {
    _clientName.dispose();
    _siteLocation.dispose();
    _city.dispose();
    for (final contact in _contacts) {
      contact.dispose();
    }
    _remarks.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final lead = Lead(
      id: 'QPMS-${(widget.leadCount + 1).toString().padLeft(3, '0')}',
      clientName: _clientName.text.trim(),
      industryType: _industryType,
      leadSource: _leadSource,
      siteLocation: _siteLocation.text.trim(),
      state: _state,
      city: _city.text.trim(),
      contactPersons: _contacts.map((contact) => contact.toContact()).toList(),
      createdByUserId: widget.user.id,
      createdByName: widget.user.name,
      assignedBdExecutive: _assignedBdExecutive,
      assignedBdEmail: _assignedBdEmail,
      leadPriority: _priority,
      remarks: _remarks.text.trim(),
      serviceScope: _serviceScope.toList(),
      status: _status,
      createdAt: DateTime.now(),
    );

    widget.onLeadCreated(lead);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Lead created successfully'),
        behavior: SnackBarBehavior.floating,
      ),
    );
    Navigator.of(context).pushReplacement(
      fadeRoute<void>(LeadDetailScreen(lead: lead, onDelete: () {})),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AppShell(
      title: 'Add New Lead',
      subtitle: 'Initial lead capture',
      bottomBar: StickySubmitBar(onSubmit: _submit),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SectionTitle(title: 'Client Details'),
            const SizedBox(height: 12),
            PremiumCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  AppTextField(
                    controller: _clientName,
                    label: 'Client / Company Name',
                  ),
                  AppDropdown(
                    label: 'Industry Type',
                    value: _industryType,
                    items: industryOptions,
                    onChanged: (value) =>
                        setState(() => _industryType = value!),
                  ),
                  AppTextField(
                    controller: _siteLocation,
                    label: 'Site Location',
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: AppDropdown(
                          label: 'State',
                          value: _state,
                          items: stateOptions,
                          onChanged: (value) => setState(() => _state = value!),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: AppTextField(controller: _city, label: 'City'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            const SectionTitle(title: 'Contact Details'),
            const SizedBox(height: 12),
            PremiumCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  ..._contacts.asMap().entries.map(
                    (entry) => _ContactPersonFormCard(
                      index: entry.key,
                      contact: entry.value,
                      canRemove: _contacts.length > 1,
                      onPrimary: () {
                        setState(() {
                          for (final contact in _contacts) {
                            contact.isPrimary = contact == entry.value;
                          }
                        });
                      },
                      onRemove: () {
                        setState(() {
                          entry.value.dispose();
                          _contacts.remove(entry.value);
                          if (_contacts.length == 1) {
                            _contacts.first.isPrimary = true;
                          } else if (!_contacts.any(
                            (contact) => contact.isPrimary,
                          )) {
                            _contacts.first.isPrimary = true;
                          }
                        });
                      },
                    ),
                  ),
                  Align(
                    alignment: Alignment.centerLeft,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        setState(() {
                          _contacts.add(_ContactFormState());
                        });
                      },
                      icon: const Icon(Icons.add_rounded),
                      label: const Text('Add Contact Person'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: qpms600,
                        side: const BorderSide(color: qpms300),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            const SectionTitle(title: 'Service Scope'),
            const SizedBox(height: 12),
            PremiumCard(
              padding: const EdgeInsets.all(16),
              child: Wrap(
                spacing: 10,
                runSpacing: 10,
                children: leadServiceScopes.map((scope) {
                  final selected = _serviceScope.contains(scope);
                  return FilterChip(
                    label: Text(scope),
                    selected: selected,
                    onSelected: (value) {
                      setState(() {
                        if (value) {
                          _serviceScope.add(scope);
                        } else {
                          _serviceScope.remove(scope);
                        }
                      });
                    },
                    selectedColor: qpms100,
                    checkmarkColor: qpms600,
                    labelStyle: TextStyle(
                      color: selected ? qpms700 : slate950,
                      fontWeight: FontWeight.w800,
                    ),
                    side: BorderSide(
                      color: selected ? qpms300 : const Color(0xFFE2E8F0),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 18),
            const SectionTitle(title: 'Lead Information'),
            const SizedBox(height: 12),
            PremiumCard(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  AppDropdown(
                    label: 'Lead Source',
                    value: _leadSource,
                    items: leadSources,
                    onChanged: (value) => setState(() => _leadSource = value!),
                  ),
                  AppDropdown(
                    label: 'Lead Priority',
                    value: _priority,
                    items: leadPriorities,
                    onChanged: (value) => setState(() => _priority = value!),
                  ),
                  AppDropdown(
                    label: 'Assigned BD Executive',
                    value: _assignedBdExecutive,
                    items: mockUsers
                        .where((user) => user.role == 'BD Executive')
                        .map((user) => user.name)
                        .toList(),
                    onChanged: (value) {
                      final selected = mockUsers.firstWhere(
                        (user) => user.name == value,
                      );
                      setState(() {
                        _assignedBdExecutive = selected.name;
                        _assignedBdEmail = selected.email;
                      });
                    },
                  ),
                  AppDropdown(
                    label: 'Status',
                    value: _status,
                    items: leadStatusOptions,
                    onChanged: (value) => setState(() => _status = value!),
                  ),
                  AppTextField(
                    controller: _remarks,
                    label: 'Remarks',
                    maxLines: 4,
                  ),
                  Row(
                    children: [
                      const Text(
                        'Lead Status',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          color: slate950,
                        ),
                      ),
                      const Spacer(),
                      StatusBadge(text: _status),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ContactPersonFormCard extends StatelessWidget {
  const _ContactPersonFormCard({
    required this.index,
    required this.contact,
    required this.canRemove,
    required this.onPrimary,
    required this.onRemove,
  });

  final int index;
  final _ContactFormState contact;
  final bool canRemove;
  final VoidCallback onPrimary;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: ExpansionTile(
        initiallyExpanded: index == 0,
        tilePadding: EdgeInsets.zero,
        childrenPadding: EdgeInsets.zero,
        title: Row(
          children: [
            Expanded(
              child: Text(
                'Contact Person ${index + 1}',
                style: const TextStyle(
                  color: slate950,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
            if (contact.isPrimary)
              const StatusBadge(text: 'Primary', color: Color(0xFF10B981)),
          ],
        ),
        children: [
          const SizedBox(height: 10),
          AppTextField(controller: contact.name, label: 'Contact Person Name'),
          AppTextField(controller: contact.designation, label: 'Designation'),
          AppTextField(
            controller: contact.phone,
            label: 'Contact Number',
            keyboardType: TextInputType.phone,
            validator: (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Required';
              }
              if (value.trim().length < 10) {
                return 'Enter a valid contact number';
              }
              return null;
            },
          ),
          AppTextField(
            controller: contact.email,
            label: 'Email ID',
            keyboardType: TextInputType.emailAddress,
            validator: (value) {
              final text = value?.trim() ?? '';
              if (text.isEmpty) {
                return 'Required';
              }
              if (!text.contains('@')) {
                return 'Enter a valid email';
              }
              return null;
            },
          ),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: contact.isPrimary ? null : onPrimary,
                  child: Text(
                    contact.isPrimary ? 'Primary Contact' : 'Set as Primary',
                  ),
                ),
              ),
              if (canRemove) ...[
                const SizedBox(width: 10),
                IconButton.outlined(
                  onPressed: onRemove,
                  color: const Color(0xFFE11D48),
                  icon: const Icon(Icons.delete_outline),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

class LeadDetailScreen extends StatelessWidget {
  const LeadDetailScreen({
    super.key,
    required this.lead,
    required this.onDelete,
  });

  final Lead lead;
  final VoidCallback onDelete;

  Future<void> _confirmDelete(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Lead?'),
        content: const Text(
          'Are you sure you want to delete this lead? This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: FilledButton.styleFrom(backgroundColor: Color(0xFFE11D48)),
            child: const Text('Delete Lead'),
          ),
        ],
      ),
    );

    if (confirmed == true) onDelete();
  }

  @override
  Widget build(BuildContext context) {
    return AppShell(
      title: lead.clientName,
      subtitle: '${lead.id} - Initial lead',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PremiumCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        lead.clientName,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ),
                    StatusBadge(text: lead.status),
                  ],
                ),
                const SizedBox(height: 10),
                PriorityBadge(priority: lead.leadPriority),
                const SizedBox(height: 18),
                DetailGrid(
                  items: {
                    'Industry Type': lead.industryType,
                    'Lead Source': lead.leadSource,
                    'Site Location': lead.siteLocation,
                    'State': lead.state,
                    'City': lead.city,
                    'Primary Contact': lead.contactPersonName,
                    'Assigned BD Executive': lead.assignedBdExecutive,
                    'Service Scope': lead.serviceScope.isEmpty
                        ? 'Not selected'
                        : lead.serviceScope.join(', '),
                    'Created By': lead.createdByName,
                    'Workflow Stage': lead.status,
                    'Scheduled Visit Date': lead.scheduledVisitDate == null
                        ? 'Not scheduled'
                        : formatDate(lead.scheduledVisitDate!),
                    'Scheduled Visit Time':
                        lead.scheduledVisitTime ?? 'Not scheduled',
                    'Site MOM Status': lead.siteMomStatus,
                    'Remarks': lead.remarks,
                  },
                ),
                const SizedBox(height: 16),
                const SectionTitle(title: 'Contact Persons'),
                const SizedBox(height: 10),
                ...lead.contactPersons.map(
                  (contact) => Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(13),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                contact.name,
                                style: const TextStyle(
                                  color: slate950,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ),
                            if (contact.isPrimary)
                              const StatusBadge(
                                text: 'Primary',
                                color: Color(0xFF10B981),
                              ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '${contact.designation} • ${contact.phone}',
                          style: const TextStyle(
                            color: slate500,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          contact.email,
                          style: const TextStyle(
                            color: slate500,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () => _confirmDelete(context),
              icon: const Icon(Icons.delete_outline),
              label: const Text('Delete Lead'),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFFE11D48),
                minimumSize: const Size.fromHeight(50),
                side: const BorderSide(color: Color(0xFFFECACA)),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(18),
                ),
                textStyle: const TextStyle(fontWeight: FontWeight.w900),
              ),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: () {
                Navigator.of(
                  context,
                ).push(fadeRoute<void>(LeadMomPreviewScreen(lead: lead)));
              },
              icon: const Icon(Icons.description_outlined),
              label: const Text('Create Lead MOM'),
              style: FilledButton.styleFrom(
                backgroundColor: qpms600,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(52),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(18),
                ),
                textStyle: const TextStyle(fontWeight: FontWeight.w900),
              ),
            ),
          ),
          if (lead.status == 'Site Visit Scheduled') ...[
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  Navigator.of(context).push(
                    fadeRoute<void>(SiteVisitAssessmentScreen(lead: lead)),
                  );
                },
                icon: const Icon(Icons.fact_check_outlined),
                label: const Text('Open Site Visit Assessment'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: qpms600,
                  minimumSize: const Size.fromHeight(52),
                  side: const BorderSide(color: qpms300),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18),
                  ),
                  textStyle: const TextStyle(fontWeight: FontWeight.w900),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class LeadMomPreviewScreen extends StatefulWidget {
  const LeadMomPreviewScreen({super.key, required this.lead});

  final Lead lead;

  @override
  State<LeadMomPreviewScreen> createState() => _LeadMomPreviewScreenState();
}

class _LeadMomPreviewScreenState extends State<LeadMomPreviewScreen> {
  DateTime? _scheduledDate;
  TimeOfDay? _scheduledTime;
  DateTime? _nextFollowUpDate;
  late final TextEditingController _siteVisitRemarks;

  Lead get lead => widget.lead;

  @override
  void initState() {
    super.initState();
    _scheduledDate = lead.scheduledVisitDate;
    _siteVisitRemarks = TextEditingController(text: lead.siteVisitRemarks);

    final savedTime = lead.scheduledVisitTime;
    if (savedTime != null && savedTime.contains(':')) {
      final parts = savedTime.split(':');
      _scheduledTime = TimeOfDay(
        hour: int.tryParse(parts[0]) ?? 9,
        minute: int.tryParse(parts[1]) ?? 0,
      );
    }
  }

  @override
  void dispose() {
    _siteVisitRemarks.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _scheduledDate ?? now,
      firstDate: now,
      lastDate: now.add(const Duration(days: 180)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: Theme.of(
              context,
            ).colorScheme.copyWith(primary: qpms600, surface: Colors.white),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() => _scheduledDate = picked);
    }
  }

  Future<void> _pickFollowUpDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _nextFollowUpDate ?? now.add(const Duration(days: 3)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 180)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: Theme.of(
              context,
            ).colorScheme.copyWith(primary: qpms600, surface: Colors.white),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() => _nextFollowUpDate = picked);
    }
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _scheduledTime ?? const TimeOfDay(hour: 10, minute: 0),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: Theme.of(
              context,
            ).colorScheme.copyWith(primary: qpms600, surface: Colors.white),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() => _scheduledTime = picked);
    }
  }

  void _sendMom() {
    final hasSiteVisitSchedule =
        _scheduledDate != null && _scheduledTime != null;
    if (!hasSiteVisitSchedule && _nextFollowUpDate == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text(leadMomScheduleError)));
      return;
    }

    lead.status = hasSiteVisitSchedule
        ? 'Site Visit Scheduled'
        : 'Lead MOM Sent';
    lead.scheduledVisitDate = _scheduledDate;
    lead.scheduledVisitTime = _scheduledTime == null
        ? null
        : formatTimeOfDay(_scheduledTime!);
    lead.siteVisitRemarks = _siteVisitRemarks.text.trim();
    lead.siteMomStatus = 'Pending';
    QpmsSupabaseService.sendLeadMomEmail({
      'to': lead.emailId,
      'cc': 'bdhead@qpms.in, coo@qpms.in',
      'subject': 'Lead Minutes of Meeting - ${lead.clientName} - QPMS',
      'clientName': lead.clientName,
      'primaryContact': lead.contactPersonName,
      'primaryContactEmail': lead.emailId,
      'location': lead.siteLocation,
      'assignedBdExecutive': lead.assignedBdExecutive,
      'assignedBdEmail': lead.assignedBdEmail,
      'discussionSummary':
          'Initial lead discussion completed for ${lead.clientName}.',
      'serviceScope': lead.serviceScope,
      'scheduledVisitDate': _scheduledDate?.toIso8601String().split('T').first,
      'scheduledVisitTime': _scheduledTime == null
          ? null
          : formatTimeOfDay(_scheduledTime!),
      'nextFollowUpDate': _nextFollowUpDate?.toIso8601String().split('T').first,
      'siteVisitRemarks': lead.siteVisitRemarks,
    }).catchError((Object error) {
      debugPrint('Lead MOM email failed: $error');
    });
    final remoteLeadId = lead.remoteLeadId;
    if (remoteLeadId != null) {
      QpmsSupabaseService.saveLeadMom(
        leadId: remoteLeadId,
        sent: true,
        mom: {
          'to_email': lead.emailId,
          'cc_emails': 'bdhead@qpms.in, coo@qpms.in',
          'subject': 'Lead Minutes of Meeting - ${lead.clientName} - QPMS',
          'discussion_summary':
              'Initial lead discussion completed for ${lead.clientName}.',
          'service_scope_discussion': lead.serviceScope.join('\n'),
          'action_items': '',
          'next_followup_date': _nextFollowUpDate
              ?.toIso8601String()
              .split('T')
              .first,
          'scheduled_site_visit_date': _scheduledDate
              ?.toIso8601String()
              .split('T')
              .first,
          'scheduled_site_visit_time': _scheduledTime == null
              ? null
              : formatTimeOfDay(_scheduledTime!),
          'calendar_invite_sent': hasSiteVisitSchedule,
          'site_visit_remarks': lead.siteVisitRemarks,
        },
      );
      if (hasSiteVisitSchedule) {
        QpmsSupabaseService.createSiteVisit({
          'lead_id': remoteLeadId,
          'client_name': lead.clientName,
          'site_name': lead.siteLocation,
          'scheduled_visit_date': _scheduledDate!
              .toIso8601String()
              .split('T')
              .first,
          'scheduled_visit_time': formatTimeOfDay(_scheduledTime!),
          'assigned_bd_executive': lead.assignedBdExecutive,
          'assigned_bd_email': lead.assignedBdEmail,
          'current_stage': 'Pre-Operational Assessment',
          'status': 'Scheduled',
          'mom_status': 'Pending',
        }).then((siteVisitId) => lead.remoteSiteVisitId = siteVisitId);
      }
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          hasSiteVisitSchedule
              ? 'Lead MOM sent and Site Visit scheduled successfully.'
              : 'Lead MOM sent successfully.',
        ),
      ),
    );
    Navigator.of(context).maybePop();
  }

  @override
  Widget build(BuildContext context) {
    return AppShell(
      title: 'Lead MOM Preview',
      subtitle: 'Scheduling / follow-up before sending',
      bottomBar: SafeArea(
        top: false,
        child: Container(
          padding: const EdgeInsets.fromLTRB(18, 12, 18, 16),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.96),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 24,
                offset: const Offset(0, -10),
              ),
            ],
          ),
          child: FilledButton.icon(
            onPressed: _sendMom,
            icon: const Icon(Icons.send_rounded),
            label: const Text('Send MOM'),
            style: FilledButton.styleFrom(
              backgroundColor: qpms600,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(52),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(18),
              ),
              textStyle: const TextStyle(fontWeight: FontWeight.w900),
            ),
          ),
        ),
      ),
      child: Column(
        children: [
          PremiumCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Lead Minutes of Meeting',
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          color: slate950,
                        ),
                      ),
                    ),
                    StatusBadge(text: 'Draft', color: Color(0xFF7C3AED)),
                  ],
                ),
                const SizedBox(height: 18),
                MomRow(label: 'Client Name', value: lead.clientName),
                MomRow(label: 'To', value: lead.emailId),
                MomRow(
                  label: 'Additional Recipients',
                  value:
                      lead.contactPersons
                          .where((contact) => !contact.isPrimary)
                          .map((contact) => contact.email)
                          .where((email) => email.isNotEmpty)
                          .join(', ')
                          .isEmpty
                      ? 'None'
                      : lead.contactPersons
                            .where((contact) => !contact.isPrimary)
                            .map((contact) => contact.email)
                            .where((email) => email.isNotEmpty)
                            .join(', '),
                ),
                const MomRow(label: 'CC', value: 'BD Head, COO'),
                MomRow(
                  label: 'Contact Person',
                  value:
                      '${lead.contactPersonName}, ${lead.contactPersonDesignation}',
                ),
                MomRow(
                  label: 'Site Location',
                  value: '${lead.siteLocation}, ${lead.city}, ${lead.state}',
                ),
                MomRow(
                  label: 'Discussion Summary',
                  value:
                      'Initial lead discussion completed for ${lead.clientName}. Notes: ${lead.remarks}',
                ),
                MomRow(
                  label: 'Service Scope',
                  value: lead.serviceScope.isEmpty
                      ? 'Not selected'
                      : lead.serviceScope.join('\n'),
                ),
                MomRow(
                  label: 'Next Follow-up Date',
                  value: _nextFollowUpDate == null
                      ? 'Not selected'
                      : formatDate(_nextFollowUpDate!),
                ),
                const MomRow(label: 'Created By', value: 'BD Executive'),
                const MomRow(label: 'Status', value: 'Draft'),
              ],
            ),
          ),
          const SizedBox(height: 16),
          PremiumCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.event_available, color: qpms600),
                    SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Scheduling / Follow-up',
                        style: TextStyle(
                          color: slate950,
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    StatusBadge(text: 'Pending', color: Color(0xFFF59E0B)),
                  ],
                ),
                const SizedBox(height: 10),
                const Text(
                  'Provide either a scheduled site visit date & time or a next follow-up date before sending.',
                  style: TextStyle(
                    color: slate500,
                    fontWeight: FontWeight.w700,
                    height: 1.45,
                  ),
                ),
                const SizedBox(height: 16),
                SchedulePickerTile(
                  icon: Icons.calendar_month_outlined,
                  label: 'Scheduled Site Visit Date',
                  value: _scheduledDate == null
                      ? 'Select date'
                      : formatDate(_scheduledDate!),
                  onTap: _pickDate,
                ),
                const SizedBox(height: 12),
                SchedulePickerTile(
                  icon: Icons.schedule_rounded,
                  label: 'Scheduled Site Visit Time',
                  value: _scheduledTime == null
                      ? 'Select time'
                      : formatTimeOfDay(_scheduledTime!),
                  onTap: _pickTime,
                ),
                const SizedBox(height: 12),
                SchedulePickerTile(
                  icon: Icons.event_repeat_outlined,
                  label: 'Next Follow-up Date',
                  value: _nextFollowUpDate == null
                      ? 'Select date'
                      : formatDate(_nextFollowUpDate!),
                  onTap: _pickFollowUpDate,
                ),
                const SizedBox(height: 12),
                StatusBadge(
                  text: _scheduledDate != null && _scheduledTime != null
                      ? 'Calendar invite will be attached'
                      : _nextFollowUpDate != null
                      ? 'Follow-up date will be included in mail'
                      : 'Schedule required',
                  color: _scheduledDate != null && _scheduledTime != null
                      ? const Color(0xFF10B981)
                      : const Color(0xFFF59E0B),
                ),
                const SizedBox(height: 12),
                AppTextField(
                  controller: _siteVisitRemarks,
                  label: 'Site Visit Remarks',
                  maxLines: 4,
                  validator: (_) => null,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class SiteVisitAssessmentScreen extends StatefulWidget {
  const SiteVisitAssessmentScreen({super.key, required this.lead});

  final Lead lead;

  @override
  State<SiteVisitAssessmentScreen> createState() =>
      _SiteVisitAssessmentScreenState();
}

class _SiteVisitAssessmentScreenState extends State<SiteVisitAssessmentScreen> {
  final List<String> _sections = const [
    'Basic Site Information',
    'Hard Services',
    'Soft Services',
    'HSE Compliance',
    'Manpower',
    'Equipment & Consumables',
    'Risk Assessment',
    'Commercial Statement',
  ];

  final Set<String> _mechanical = <String>{};
  final Set<String> _electrical = <String>{};
  final Set<String> _housekeeping = <String>{};
  final Set<String> _security = <String>{};
  final Set<String> _waste = <String>{};
  final List<String> _photoSlots = const [
    'Entrance',
    'Service Area',
    'Equipment Scope',
    'HK Area',
    'Washroom',
    'Electrical Room',
    'Fire Panel',
    'Pump Room',
    'DG Area',
    'Basement / Parking',
    'Waste Disposal Area',
  ];

  int _activeSection = 0;
  int _photoCount = 0;
  double _revenue = 0;
  double _expense = 0;
  double _nonBillable = 0;
  String _marginType = marginTypeOptions.first;

  double get _margin => _revenue - _expense - _nonBillable;
  double get _marginPercent => _revenue == 0 ? 0 : (_margin / _revenue) * 100;

  Future<void> _saveAssessment({required bool submit}) async {
    final siteVisitId = widget.lead.remoteSiteVisitId;
    final leadId = widget.lead.remoteLeadId;
    if (siteVisitId != null) {
      await QpmsSupabaseService.saveAssessment({
        'site_visit_id': siteVisitId,
        'lead_id': leadId,
        'basic_site_information': {
          'site_address': widget.lead.siteLocation,
          'site_type': widget.lead.industryType,
          'site_survey_date': DateTime.now().toIso8601String(),
          'assessed_by': widget.lead.assignedBdExecutive,
          'site_contact_person': widget.lead.contactPersonName,
          'contact_number': widget.lead.contactNumber,
          'contact_email': widget.lead.emailId,
        },
        'ifm_service_scope': {},
        'hard_services': {
          'mechanical_services': _mechanical.toList(),
          'electrical_services': _electrical.toList(),
        },
        'soft_services': {
          'housekeeping_services': _housekeeping.toList(),
          'security_services': _security.toList(),
          'waste_management_services': _waste.toList(),
        },
        'landscaping_pest_control': {},
        'hse_compliance': {},
        'manpower_requirement': {},
        'tools_equipment_consumables': {},
        'client_kyc': {},
        'risk_assessment': {},
        'penalty_clauses': {},
        'commercial_statement': {
          'estimated_monthly_billing': _revenue,
          'estimated_monthly_expense': _expense,
          'non_billable_items': _nonBillable,
          'monthly_margin': _margin,
          'expected_margin_percentage': _marginPercent,
          'margin_type': _marginType,
        },
        'approval_mechanism': {
          'coo_approval_required': _revenue > 500000,
          'cfo_approval_required': _revenue > 500000,
          'cmd_counter_approval_required': _revenue > 2500000,
        },
        'final_remarks_signoff': {},
        'assessment_status': submit ? 'Submitted' : 'Draft',
        'created_by': widget.lead.assignedBdEmail,
      });
    }
  }

  void _toggle(Set<String> target, String value) {
    setState(() {
      if (target.contains(value)) {
        target.remove(value);
      } else {
        target.add(value);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return AppShell(
      title: 'Site Assessment',
      subtitle: widget.lead.clientName,
      bottomBar: SafeArea(
        top: false,
        child: Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.96),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.08),
                blurRadius: 24,
                offset: const Offset(0, -10),
              ),
            ],
          ),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () async {
                    await _saveAssessment(submit: false);
                    if (!context.mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Assessment draft saved.')),
                    );
                  },
                  icon: const Icon(Icons.save_outlined),
                  label: const Text('Save Draft'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: FilledButton.icon(
                  onPressed: () async {
                    await _saveAssessment(submit: true);
                    if (!context.mounted) return;
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Submitted for Commercial Review.'),
                      ),
                    );
                  },
                  icon: const Icon(Icons.send_rounded),
                  label: const Text('Commercial Review'),
                  style: FilledButton.styleFrom(
                    backgroundColor: qpms600,
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          PremiumCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        widget.lead.clientName,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                    ),
                    const StatusBadge(text: 'Scheduled'),
                  ],
                ),
                const SizedBox(height: 12),
                DetailGrid(
                  items: {
                    'Scheduled Date': widget.lead.scheduledVisitDate == null
                        ? 'Not scheduled'
                        : formatDate(widget.lead.scheduledVisitDate!),
                    'Scheduled Time':
                        widget.lead.scheduledVisitTime ?? 'Not scheduled',
                    'Site': widget.lead.siteLocation,
                    'City': widget.lead.city,
                    'Stage': 'Pre-Operational Assessment',
                    'MOM Status': widget.lead.siteMomStatus,
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(
                _sections.length,
                (index) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(_sections[index]),
                    selected: _activeSection == index,
                    onSelected: (_) => setState(() => _activeSection = index),
                    selectedColor: qpms100,
                    labelStyle: TextStyle(
                      color: _activeSection == index ? qpms700 : slate500,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),
          _buildActiveSection(),
        ],
      ),
    );
  }

  Widget _buildActiveSection() {
    switch (_sections[_activeSection]) {
      case 'Basic Site Information':
        return _basicSection();
      case 'Hard Services':
        return _hardServices();
      case 'Soft Services':
        return _softServices();
      case 'HSE Compliance':
        return _hseCompliance();
      case 'Manpower':
        return _manpower();
      case 'Equipment & Consumables':
        return _equipment();
      case 'Risk Assessment':
        return _riskAssessment();
      case 'Commercial Statement':
        return _commercial();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _basicSection() {
    return Column(
      children: [
        PremiumCard(
          child: Column(
            children: const [
              AssessmentField(label: 'Site Address'),
              AssessmentField(label: 'Site Type'),
              AssessmentField(label: 'Operating Hours'),
              AssessmentField(label: 'Client Occupancy'),
              AssessmentField(label: 'Building Age'),
            ],
          ),
        ),
        const SizedBox(height: 14),
        PremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.photo_camera_outlined, color: qpms600),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Text(
                      'Site Photos & Evidence',
                      style: TextStyle(
                        color: slate950,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  StatusBadge(text: '$_photoCount images'),
                ],
              ),
              const SizedBox(height: 14),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: _photoSlots
                    .map(
                      (slot) => InkWell(
                        borderRadius: BorderRadius.circular(18),
                        onTap: () => setState(() => _photoCount++),
                        child: Container(
                          width: 150,
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Column(
                            children: [
                              const Icon(
                                Icons.cloud_upload_outlined,
                                color: qpms600,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                slot,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  color: slate950,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'Tap to add',
                                style: TextStyle(
                                  color: slate500,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    )
                    .toList(),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _hardServices() {
    return Column(
      children: [
        ServiceChecklistCard(
          title: 'Mechanical Services',
          selected: _mechanical,
          items: const [
            'HVAC Systems',
            'Chillers',
            'AHU',
            'FCU',
            'Ventilation',
            'Pumps',
            'Fire Fighting',
            'STP / WTP',
            'RO Plant',
            'Air Compressors',
          ],
          onToggle: (value) => _toggle(_mechanical, value),
        ),
        const SizedBox(height: 14),
        ServiceChecklistCard(
          title: 'Electrical Services',
          selected: _electrical,
          items: const [
            'Main Panels / MDB',
            'SMDB / DB',
            'Generators',
            'UPS Systems',
            'Lighting Systems',
            'Transformers',
            'LT Panels',
            'Battery Banks',
          ],
          onToggle: (value) => _toggle(_electrical, value),
        ),
      ],
    );
  }

  Widget _softServices() {
    return Column(
      children: [
        ServiceChecklistCard(
          title: 'Housekeeping Areas',
          selected: _housekeeping,
          items: const [
            'Lobby',
            'Common Areas',
            'Washrooms',
            'Cafeteria',
            'Parking',
            'External Areas',
            'Glass Cleaning',
            'Facade Cleaning',
            'Pantry',
          ],
          onToggle: (value) => _toggle(_housekeeping, value),
        ),
        const SizedBox(height: 14),
        ServiceChecklistCard(
          title: 'Security Services',
          selected: _security,
          items: const [
            'CCTV Monitoring',
            'Access Control',
            'Visitor Management',
            'Emergency Response',
            'Parking Security',
            'Night Patrol',
            'Baggage Screening',
          ],
          onToggle: (value) => _toggle(_security, value),
        ),
        const SizedBox(height: 14),
        ServiceChecklistCard(
          title: 'Waste Management',
          selected: _waste,
          items: const [
            'General Waste',
            'Dry Waste',
            'Wet Waste',
            'Biomedical Waste',
            'Hazardous Waste',
            'E-Waste',
          ],
          onToggle: (value) => _toggle(_waste, value),
        ),
      ],
    );
  }

  Widget _hseCompliance() {
    const items = [
      'Fire Safety',
      'Emergency Exit',
      'PPE',
      'Chemical Storage',
      'Safety Signage',
      'Electrical Safety',
      'Work at Height Safety',
      'First Aid',
      'Emergency Response Plan',
    ];
    return PremiumCard(
      child: Column(
        children: items
            .map(
              (item) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: AssessmentStatusRow(label: item),
              ),
            )
            .toList(),
      ),
    );
  }

  Widget _manpower() {
    const departments = [
      'Housekeeping',
      'Security',
      'Technical',
      'Waste Management',
      'Landscaping',
      'Pantry',
      'Helpdesk',
    ];
    return PremiumCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: departments
            .map(
              (department) => Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      department,
                      style: const TextStyle(
                        color: slate950,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 10),
                    const AssessmentField(label: 'Designation'),
                    const AssessmentField(label: 'Shift Type'),
                    const AssessmentField(label: 'Count'),
                    const AssessmentField(label: 'Wage Category'),
                  ],
                ),
              ),
            )
            .toList(),
      ),
    );
  }

  Widget _equipment() {
    return const Column(
      children: [
        PremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Equipment Inventory',
                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
              ),
              SizedBox(height: 12),
              AssessmentField(label: 'Equipment Name'),
              AssessmentField(label: 'Brand'),
              AssessmentField(label: 'Capacity'),
              AssessmentField(label: 'Quantity'),
              AssessmentField(label: 'Monthly Cost'),
            ],
          ),
        ),
        SizedBox(height: 14),
        PremiumCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Chemicals & Tools',
                style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
              ),
              SizedBox(height: 12),
              AssessmentField(label: 'Chemical Name'),
              AssessmentField(label: 'Usage Area'),
              AssessmentField(label: 'Monthly Consumption'),
              AssessmentField(label: 'Tool Name'),
              AssessmentField(label: 'Department'),
            ],
          ),
        ),
      ],
    );
  }

  Widget _riskAssessment() {
    const risks = [
      'Financial Risk',
      'Operational Risk',
      'Compliance Risk',
      'Workforce Risk',
      'Safety Risk',
      'Client Reputation Risk',
    ];
    return Column(
      children: risks
          .map(
            (risk) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: PremiumCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      risk,
                      style: const TextStyle(
                        color: slate950,
                        fontWeight: FontWeight.w900,
                        fontSize: 18,
                      ),
                    ),
                    const SizedBox(height: 12),
                    const AssessmentField(label: 'Risk Level'),
                    const AssessmentField(label: 'Notes'),
                    const AssessmentField(label: 'Mitigation Plan'),
                  ],
                ),
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _commercial() {
    return PremiumCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Commercial Viability',
            style: TextStyle(
              color: slate950,
              fontWeight: FontWeight.w900,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: 12),
          AppDropdown(
            label: 'Margin Type',
            value: _marginType,
            items: marginTypeOptions,
            onChanged: (value) => setState(() => _marginType = value!),
          ),
          NumberAssessmentField(
            label: 'Estimated Revenue',
            onChanged: (value) => setState(() => _revenue = value),
          ),
          NumberAssessmentField(
            label: 'Monthly Operational Cost',
            onChanged: (value) => setState(() => _expense = value),
          ),
          NumberAssessmentField(
            label: 'Non-Billable Cost',
            onChanged: (value) => setState(() => _nonBillable = value),
          ),
          const SizedBox(height: 12),
          DetailGrid(
            items: {
              'Margin Summary': currencyMobile(_margin),
              'Expected Margin %': '${_marginPercent.toStringAsFixed(1)}%',
            },
          ),
        ],
      ),
    );
  }
}

class ServiceChecklistCard extends StatelessWidget {
  const ServiceChecklistCard({
    super.key,
    required this.title,
    required this.items,
    required this.selected,
    required this.onToggle,
  });

  final String title;
  final List<String> items;
  final Set<String> selected;
  final ValueChanged<String> onToggle;

  @override
  Widget build(BuildContext context) {
    return PremiumCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: slate950,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: items
                .map(
                  (item) => FilterChip(
                    label: Text(item),
                    selected: selected.contains(item),
                    onSelected: (_) => onToggle(item),
                    selectedColor: qpms100,
                    checkmarkColor: qpms600,
                    labelStyle: TextStyle(
                      color: selected.contains(item) ? qpms700 : slate500,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                )
                .toList(),
          ),
          if (selected.isNotEmpty) ...[
            const SizedBox(height: 14),
            ...selected.map(
              (item) => Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item,
                      style: const TextStyle(
                        color: slate950,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 10),
                    const AssessmentField(label: 'Quantity / Capacity'),
                    const AssessmentField(label: 'Existing Condition'),
                    const AssessmentField(label: 'Vendor / AMC Support'),
                    const AssessmentField(label: 'Remarks'),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class AssessmentStatusRow extends StatelessWidget {
  const AssessmentStatusRow({super.key, required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: slate950,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: const [
              StatusBadge(text: 'Compliant', color: Color(0xFF059669)),
              StatusBadge(text: 'Partial', color: Color(0xFFF59E0B)),
              StatusBadge(text: 'Non-Compliant', color: Color(0xFFE11D48)),
              StatusBadge(text: 'Risk: Medium', color: Color(0xFF2563EB)),
            ],
          ),
          const SizedBox(height: 10),
          const AssessmentField(label: 'Remarks'),
        ],
      ),
    );
  }
}

class AssessmentField extends StatelessWidget {
  const AssessmentField({super.key, required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextField(decoration: InputDecoration(labelText: label)),
    );
  }
}

class NumberAssessmentField extends StatelessWidget {
  const NumberAssessmentField({
    super.key,
    required this.label,
    required this.onChanged,
  });

  final String label;
  final ValueChanged<double> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextField(
        keyboardType: TextInputType.number,
        onChanged: (value) => onChanged(double.tryParse(value) ?? 0),
        decoration: InputDecoration(labelText: label),
      ),
    );
  }
}

class AppShell extends StatelessWidget {
  const AppShell({
    super.key,
    required this.title,
    required this.subtitle,
    required this.child,
    this.bottomBar,
  });

  final String title;
  final String subtitle;
  final Widget child;
  final Widget? bottomBar;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      bottomNavigationBar: bottomBar,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFF8FBFF), appBackground],
          ),
        ),
        child: SafeArea(
          child: CustomScrollView(
            slivers: [
              SliverAppBar(
                pinned: true,
                backgroundColor: appBackground,
                surfaceTintColor: appBackground,
                titleSpacing: 0,
                leading: IconButton(
                  onPressed: () => Navigator.of(context).maybePop(),
                  icon: const Icon(Icons.arrow_back_rounded),
                ),
                title: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.w900),
                    ),
                    Text(
                      subtitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: slate500,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
              SliverPadding(
                padding: EdgeInsets.fromLTRB(
                  20,
                  16,
                  20,
                  bottomBar == null ? 28 : 96,
                ),
                sliver: SliverToBoxAdapter(child: child),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class PremiumCard extends StatelessWidget {
  const PremiumCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(18),
  });

  final Widget child;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.94),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE6ECF5)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0F0F172A),
            blurRadius: 28,
            offset: Offset(0, 14),
          ),
        ],
      ),
      child: child,
    );
  }
}

class StickySubmitBar extends StatelessWidget {
  const StickySubmitBar({super.key, required this.onSubmit});

  final VoidCallback onSubmit;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      minimum: const EdgeInsets.fromLTRB(20, 10, 20, 14),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.96),
          borderRadius: BorderRadius.circular(22),
          boxShadow: [
            BoxShadow(
              color: qpms600.withValues(alpha: 0.12),
              blurRadius: 26,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: FilledButton.icon(
            onPressed: onSubmit,
            icon: const Icon(Icons.check_circle_outline),
            label: const Text('Submit Lead'),
            style: FilledButton.styleFrom(
              backgroundColor: qpms600,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(50),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              textStyle: const TextStyle(fontWeight: FontWeight.w900),
              elevation: 0,
            ),
          ),
        ),
      ),
    );
  }
}

class UpcomingSiteVisitsCard extends StatelessWidget {
  const UpcomingSiteVisitsCard({super.key, required this.leads});

  final List<Lead> leads;

  @override
  Widget build(BuildContext context) {
    final momPending = leads
        .where((lead) => lead.siteMomStatus == 'Pending')
        .length;

    return PremiumCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                height: 40,
                width: 40,
                decoration: BoxDecoration(
                  color: qpms50,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(Icons.event_available, color: qpms600),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  'Site Visit & Estimation',
                  style: TextStyle(
                    color: slate950,
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              StatusBadge(text: '${leads.length} Scheduled', color: qpms600),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: SoftKpiTile(
                  label: 'Scheduled Visits',
                  value: '${leads.length}',
                  color: qpms600,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: SoftKpiTile(
                  label: 'MOM Pending',
                  value: '$momPending',
                  color: const Color(0xFFD97706),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (leads.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: const Column(
                children: [
                  Icon(Icons.event_busy_outlined, color: slate500),
                  SizedBox(height: 8),
                  Text(
                    'No site visits scheduled yet',
                    style: TextStyle(
                      color: slate950,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Send a Lead MOM with visit details to move leads here.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: slate500,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            )
          else
            ...leads
                .take(3)
                .map(
                  (lead) => Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.schedule_rounded,
                          size: 18,
                          color: qpms600,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                lead.clientName,
                                style: const TextStyle(
                                  color: slate950,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${lead.scheduledVisitDate == null ? 'Date pending' : formatDate(lead.scheduledVisitDate!)} at ${lead.scheduledVisitTime ?? 'time pending'}',
                                style: const TextStyle(
                                  color: slate500,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
        ],
      ),
    );
  }
}

class SoftKpiTile extends StatelessWidget {
  const SoftKpiTile({
    super.key,
    required this.label,
    required this.value,
    required this.color,
  });

  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.18)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.w900,
              fontSize: 20,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            label,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: slate500,
              fontSize: 11,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class MetricCard extends StatelessWidget {
  const MetricCard({super.key, required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 68),
      padding: const EdgeInsets.all(9),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.16)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w900,
              fontSize: 19,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Color(0xDDEEF4FF),
              fontSize: 10.5,
              fontWeight: FontWeight.w700,
              height: 1.2,
            ),
          ),
        ],
      ),
    );
  }
}

class LeadListTile extends StatelessWidget {
  const LeadListTile({super.key, required this.lead, required this.onTap});

  final Lead lead;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(22),
      onTap: onTap,
      child: PremiumCard(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    lead.clientName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                StatusBadge(text: lead.status),
              ],
            ),
            const SizedBox(height: 8),
            LeadMetaRow(
              icon: Icons.location_on_outlined,
              text: '${lead.city}, ${lead.state}',
            ),
            const SizedBox(height: 8),
            LeadMetaRow(
              icon: Icons.person_outline,
              text: lead.contactPersons.length > 1
                  ? '${lead.contactPersonName} + ${lead.contactPersons.length - 1} more'
                  : lead.contactPersonName,
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                LeadMetaChip(
                  icon: Icons.flag_outlined,
                  child: PriorityBadge(priority: lead.leadPriority),
                ),
                const Spacer(),
                LeadMetaRow(
                  icon: Icons.calendar_today_outlined,
                  text: formatDate(lead.createdAt),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class LeadMetaRow extends StatelessWidget {
  const LeadMetaRow({super.key, required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: const Color(0xFF94A3B8)),
        const SizedBox(width: 5),
        Text(
          text,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: slate500,
            fontSize: 12,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    );
  }
}

class LeadMetaChip extends StatelessWidget {
  const LeadMetaChip({super.key, required this.icon, required this.child});

  final IconData icon;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: const Color(0xFF94A3B8)),
        const SizedBox(width: 6),
        child,
      ],
    );
  }
}

class SchedulePickerTile extends StatelessWidget {
  const SchedulePickerTile({
    super.key,
    required this.icon,
    required this.label,
    required this.value,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final String value;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(18),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          children: [
            Container(
              height: 40,
              width: 40,
              decoration: BoxDecoration(
                color: qpms50,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: qpms600, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(
                      color: slate500,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    value,
                    style: const TextStyle(
                      color: slate950,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: slate500),
          ],
        ),
      ),
    );
  }
}

class EmptyLeadsCard extends StatelessWidget {
  const EmptyLeadsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return const PremiumCard(
      child: Column(
        children: [
          Icon(Icons.business_center_outlined, color: qpms600, size: 36),
          SizedBox(height: 10),
          Text(
            'No leads yet',
            style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18),
          ),
          SizedBox(height: 6),
          Text(
            'Tap Add Lead to create the first field lead.',
            textAlign: TextAlign.center,
            style: TextStyle(color: slate500, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class SectionTitle extends StatelessWidget {
  const SectionTitle({
    super.key,
    required this.title,
    this.actionLabel,
    this.onAction,
  });

  final String title;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: Theme.of(
              context,
            ).textTheme.titleLarge?.copyWith(fontSize: 20),
          ),
        ),
        if (actionLabel != null)
          TextButton(
            onPressed: onAction,
            child: Text(
              actionLabel!,
              style: const TextStyle(fontWeight: FontWeight.w800),
            ),
          ),
      ],
    );
  }
}

class AppTextField extends StatelessWidget {
  const AppTextField({
    super.key,
    required this.controller,
    required this.label,
    this.keyboardType,
    this.maxLines = 1,
    this.validator,
  });

  final TextEditingController controller;
  final String label;
  final TextInputType? keyboardType;
  final int maxLines;
  final String? Function(String?)? validator;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        maxLines: maxLines,
        validator:
            validator ??
            (value) {
              if (value == null || value.trim().isEmpty) {
                return 'Required';
              }
              return null;
            },
        decoration: InputDecoration(
          labelText: label,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 14,
            vertical: 13,
          ),
        ),
      ),
    );
  }
}

class AppDropdown extends StatelessWidget {
  const AppDropdown({
    super.key,
    required this.label,
    required this.value,
    required this.items,
    required this.onChanged,
  });

  final String label;
  final String value;
  final List<String> items;
  final ValueChanged<String?> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: DropdownButtonFormField<String>(
        initialValue: value,
        borderRadius: BorderRadius.circular(16),
        menuMaxHeight: 270,
        icon: const Icon(Icons.keyboard_arrow_down_rounded),
        isExpanded: true,
        dropdownColor: Colors.white,
        decoration: InputDecoration(
          labelText: label,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 14,
            vertical: 13,
          ),
        ),
        items: items
            .map(
              (item) => DropdownMenuItem<String>(
                value: item,
                child: Text(
                  item,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            )
            .toList(),
        onChanged: onChanged,
      ),
    );
  }
}

class DetailGrid extends StatelessWidget {
  const DetailGrid({super.key, required this.items});

  final Map<String, String> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: items.entries.map((entry) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 14),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 118,
                child: Text(
                  entry.key,
                  style: const TextStyle(
                    color: slate500,
                    fontWeight: FontWeight.w800,
                    fontSize: 12,
                    height: 1.35,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  entry.value,
                  style: const TextStyle(
                    color: slate950,
                    fontWeight: FontWeight.w700,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

class MomRow extends StatelessWidget {
  const MomRow({super.key, required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: slate500,
              fontWeight: FontWeight.w900,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              color: slate950,
              fontWeight: FontWeight.w700,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }
}

class StatusBadge extends StatelessWidget {
  const StatusBadge({super.key, required this.text, this.color = qpms600});

  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: color.withValues(alpha: 0.16)),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w900,
          fontSize: 11,
        ),
      ),
    );
  }
}

class PriorityBadge extends StatelessWidget {
  const PriorityBadge({super.key, required this.priority});

  final String priority;

  Color get _color {
    switch (priority) {
      case 'Urgent':
        return const Color(0xFFE11D48);
      case 'High':
        return const Color(0xFFEA580C);
      case 'Medium':
        return const Color(0xFF2563EB);
      default:
        return const Color(0xFF059669);
    }
  }

  @override
  Widget build(BuildContext context) {
    return StatusBadge(text: priority, color: _color);
  }
}

class PillBadge extends StatelessWidget {
  const PillBadge({super.key, required this.text, required this.icon});

  final String text;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: qpms50,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: qpms100),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 15, color: qpms600),
          const SizedBox(width: 7),
          Text(
            text,
            style: const TextStyle(
              color: qpms700,
              fontSize: 11,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class ErrorNotice extends StatelessWidget {
  const ErrorNotice({super.key, required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF1F2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFECACA)),
      ),
      child: Text(
        message,
        style: const TextStyle(
          color: Color(0xFFBE123C),
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class QpmsBrandMark extends StatelessWidget {
  const QpmsBrandMark({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const QpmsLogoBox(size: 62),
        const SizedBox(height: 12),
        Text(
          'QPMS',
          style: Theme.of(
            context,
          ).textTheme.titleLarge?.copyWith(color: qpms700, fontSize: 26),
        ),
      ],
    );
  }
}

class QpmsLogoBox extends StatelessWidget {
  const QpmsLogoBox({super.key, required this.size});

  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      padding: EdgeInsets.all(size * 0.14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(size * 0.28),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.12),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: Image.asset('assets/qpms-logo.png', fit: BoxFit.contain),
    );
  }
}

String formatDate(DateTime date) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return '${date.day.toString().padLeft(2, '0')} ${months[date.month - 1]} ${date.year}';
}

String formatTimeOfDay(TimeOfDay time) {
  final hour = time.hourOfPeriod == 0 ? 12 : time.hourOfPeriod;
  final minute = time.minute.toString().padLeft(2, '0');
  final period = time.period == DayPeriod.am ? 'AM' : 'PM';
  return '$hour:$minute $period';
}

String currencyMobile(double value) {
  final rounded = value.round().toString();
  final buffer = StringBuffer();
  for (var i = 0; i < rounded.length; i++) {
    final reverseIndex = rounded.length - i;
    buffer.write(rounded[i]);
    if (reverseIndex > 1 && reverseIndex % 3 == 1) {
      buffer.write(',');
    }
  }
  return 'INR ${buffer.toString()}';
}
