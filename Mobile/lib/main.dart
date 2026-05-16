import 'package:flutter/material.dart';

void main() {
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

class QpmsMobileApp extends StatefulWidget {
  const QpmsMobileApp({super.key});

  @override
  State<QpmsMobileApp> createState() => _QpmsMobileAppState();
}

class _QpmsMobileAppState extends State<QpmsMobileApp> {
  final GlobalKey<NavigatorState> _navigatorKey = GlobalKey<NavigatorState>();
  final List<Lead> _leads = [
    Lead(
      id: 'QPMS-001',
      clientName: 'Acme Facilities Pvt Ltd',
      industryType: 'Corporate Office',
      leadSource: 'Direct Visit',
      siteLocation: 'IT Park, Phase 2',
      state: 'Karnataka',
      city: 'Bengaluru',
      contactPersonName: 'Ravi Menon',
      contactPersonDesignation: 'Admin Manager',
      contactNumber: '9876543210',
      emailId: 'ravi.menon@example.com',
      leadPriority: 'High',
      remarks:
          'Initial visit completed. Client asked for a follow-up discussion with operations.',
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
    ),
  ];

  void _addLead(Lead lead) {
    setState(() {
      _leads.insert(0, lead);
    });
  }

  @override
  Widget build(BuildContext context) {
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
      home: LoginScreen(
        onLogin: () {
          _navigatorKey.currentState?.pushReplacement(
            fadeRoute(
              FieldOfficerHomeScreen(leads: _leads, onAddLead: _addLead),
            ),
          );
        },
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
    required this.contactPersonName,
    required this.contactPersonDesignation,
    required this.contactNumber,
    required this.emailId,
    required this.leadPriority,
    required this.remarks,
    required this.createdAt,
    this.status = 'New Lead',
    this.scheduledVisitDate,
    this.scheduledVisitTime,
    this.siteVisitRemarks = '',
    this.siteMomStatus = 'Pending',
  });

  final String id;
  final String clientName;
  final String industryType;
  final String leadSource;
  final String siteLocation;
  final String state;
  final String city;
  final String contactPersonName;
  final String contactPersonDesignation;
  final String contactNumber;
  final String emailId;
  final String leadPriority;
  final String remarks;
  String status;
  final DateTime createdAt;
  DateTime? scheduledVisitDate;
  String? scheduledVisitTime;
  String siteVisitRemarks;
  String siteMomStatus;
}

Route<T> fadeRoute<T>(Widget page) {
  return PageRouteBuilder<T>(
    pageBuilder: (context, animation, secondaryAnimation) => page,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      final curved = CurvedAnimation(
        parent: animation,
        curve: Curves.easeOutCubic,
      );
      return FadeTransition(
        opacity: curved,
        child: SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0.03, 0.02),
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

  final VoidCallback onLogin;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController(text: 'fo@qpms.co.in');
  final _passwordController = TextEditingController(text: '123456');
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

    if (email == 'fo@qpms.co.in' && password == '123456') {
      widget.onLogin();
      return;
    }

    setState(() {
      _isSubmitting = false;
      _error = 'Invalid Field Officer credentials.';
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
                                text: 'FIELD OFFICER ACCESS',
                                icon: Icons.verified_user_outlined,
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
                              'Sign in to create leads and manage field follow-ups.',
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
                                  'Mock login enabled',
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

class FieldOfficerHomeScreen extends StatefulWidget {
  const FieldOfficerHomeScreen({
    super.key,
    required this.leads,
    required this.onAddLead,
  });

  final List<Lead> leads;
  final ValueChanged<Lead> onAddLead;

  @override
  State<FieldOfficerHomeScreen> createState() => _FieldOfficerHomeScreenState();
}

class _FieldOfficerHomeScreenState extends State<FieldOfficerHomeScreen> {
  int _selectedIndex = 0;

  int get _momPending =>
      widget.leads.where((lead) => lead.status == 'New Lead').length;

  int get _siteVisitPending => widget.leads
      .where((lead) => lead.status == 'Site Visit Scheduled')
      .length;

  Future<void> _openAddLead() async {
    await Navigator.of(context).push(
      fadeRoute<void>(
        AddLeadScreen(
          leadCount: widget.leads.length,
          onLeadCreated: (lead) {
            widget.onAddLead(lead);
            setState(() {});
          },
        ),
      ),
    );
  }

  Future<void> _openLeadDetail(Lead lead) async {
    await Navigator.of(
      context,
    ).push(fadeRoute<void>(LeadDetailScreen(lead: lead)));
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final showOverview = _selectedIndex == 0;

    return Scaffold(
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
                  totalLeads: widget.leads.length,
                  momPending: _momPending,
                  siteVisitPending: _siteVisitPending,
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 92),
                sliver: showOverview
                    ? SliverList.list(
                        children: [
                          SectionTitle(
                            title: 'My Leads',
                            actionLabel: 'View all',
                            onAction: () => setState(() => _selectedIndex = 1),
                          ),
                          const SizedBox(height: 12),
                          UpcomingSiteVisitsCard(
                            leads: widget.leads
                                .where(
                                  (lead) =>
                                      lead.status == 'Site Visit Scheduled',
                                )
                                .toList(),
                          ),
                          const SizedBox(height: 14),
                          if (widget.leads.isEmpty)
                            const EmptyLeadsCard()
                          else
                            ...widget.leads
                                .take(3)
                                .map(
                                  (lead) => Padding(
                                    padding: const EdgeInsets.only(bottom: 14),
                                    child: LeadListTile(
                                      lead: lead,
                                      onTap: () => _openLeadDetail(lead),
                                    ),
                                  ),
                                ),
                        ],
                      )
                    : SliverList.builder(
                        itemCount: widget.leads.isEmpty
                            ? 2
                            : widget.leads.length + 1,
                        itemBuilder: (context, index) {
                          if (index == 0) {
                            return const Padding(
                              padding: EdgeInsets.only(bottom: 12),
                              child: SectionTitle(title: 'My Leads'),
                            );
                          }
                          if (widget.leads.isEmpty) {
                            return const EmptyLeadsCard();
                          }
                          final lead = widget.leads[index - 1];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 14),
                            child: LeadListTile(
                              lead: lead,
                              onTap: () => _openLeadDetail(lead),
                            ),
                          );
                        },
                      ),
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
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) =>
            setState(() => _selectedIndex = index),
        backgroundColor: Colors.white,
        indicatorColor: qpms100,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.list_alt_outlined),
            selectedIcon: Icon(Icons.list_alt),
            label: 'My Leads',
          ),
        ],
      ),
    );
  }
}

class HomeHeader extends StatelessWidget {
  const HomeHeader({
    super.key,
    required this.totalLeads,
    required this.momPending,
    required this.siteVisitPending,
  });

  final int totalLeads;
  final int momPending;
  final int siteVisitPending;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 14),
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
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
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 7,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.16),
                  ),
                ),
                child: const Text(
                  'Field Officer',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          const Text(
            'Welcome, Field Officer',
            style: TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.w900,
              letterSpacing: 0,
            ),
          ),
          const SizedBox(height: 7),
          const Text(
            'Collect initial lead details and track handoff progress.',
            style: TextStyle(
              color: Color(0xDDEEF4FF),
              fontWeight: FontWeight.w600,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 18),
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
  });

  final int leadCount;
  final ValueChanged<Lead> onLeadCreated;

  @override
  State<AddLeadScreen> createState() => _AddLeadScreenState();
}

class _AddLeadScreenState extends State<AddLeadScreen> {
  final _formKey = GlobalKey<FormState>();
  final _clientName = TextEditingController();
  final _industryType = TextEditingController();
  final _siteLocation = TextEditingController();
  final _state = TextEditingController();
  final _city = TextEditingController();
  final _contactName = TextEditingController();
  final _contactDesignation = TextEditingController();
  final _contactNumber = TextEditingController();
  final _emailId = TextEditingController();
  final _remarks = TextEditingController();

  String _leadSource = leadSources.first;
  String _priority = 'Medium';

  @override
  void dispose() {
    _clientName.dispose();
    _industryType.dispose();
    _siteLocation.dispose();
    _state.dispose();
    _city.dispose();
    _contactName.dispose();
    _contactDesignation.dispose();
    _contactNumber.dispose();
    _emailId.dispose();
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
      industryType: _industryType.text.trim(),
      leadSource: _leadSource,
      siteLocation: _siteLocation.text.trim(),
      state: _state.text.trim(),
      city: _city.text.trim(),
      contactPersonName: _contactName.text.trim(),
      contactPersonDesignation: _contactDesignation.text.trim(),
      contactNumber: _contactNumber.text.trim(),
      emailId: _emailId.text.trim(),
      leadPriority: _priority,
      remarks: _remarks.text.trim(),
      createdAt: DateTime.now(),
    );

    widget.onLeadCreated(lead);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Lead created successfully'),
        behavior: SnackBarBehavior.floating,
      ),
    );
    Navigator.of(
      context,
    ).pushReplacement(fadeRoute<void>(LeadDetailScreen(lead: lead)));
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
                  AppTextField(
                    controller: _industryType,
                    label: 'Industry Type',
                  ),
                  AppTextField(
                    controller: _siteLocation,
                    label: 'Site Location',
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: AppTextField(controller: _state, label: 'State'),
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
                  AppTextField(
                    controller: _contactName,
                    label: 'Contact Person Name',
                  ),
                  AppTextField(
                    controller: _contactDesignation,
                    label: 'Contact Person Designation',
                  ),
                  AppTextField(
                    controller: _contactNumber,
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
                    controller: _emailId,
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
                ],
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
                      StatusBadge(text: 'New Lead'),
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

class LeadDetailScreen extends StatelessWidget {
  const LeadDetailScreen({super.key, required this.lead});

  final Lead lead;

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
                    'Contact Person': lead.contactPersonName,
                    'Designation': lead.contactPersonDesignation,
                    'Contact Number': lead.contactNumber,
                    'Email ID': lead.emailId,
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
              ],
            ),
          ),
          const SizedBox(height: 18),
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
  late final TextEditingController _siteVisitRemarks;

  Lead get lead => widget.lead;

  DateTime get _followUpDate => DateTime.now().add(const Duration(days: 3));

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
    if (_scheduledDate == null || _scheduledTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Select site visit date and time before sending MOM.'),
        ),
      );
      return;
    }

    lead.status = 'Site Visit Scheduled';
    lead.scheduledVisitDate = _scheduledDate;
    lead.scheduledVisitTime = formatTimeOfDay(_scheduledTime!);
    lead.siteVisitRemarks = _siteVisitRemarks.text.trim();
    lead.siteMomStatus = 'Pending';

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Lead MOM sent and Site Visit scheduled successfully.'),
      ),
    );
    Navigator.of(context).maybePop();
  }

  @override
  Widget build(BuildContext context) {
    return AppShell(
      title: 'Lead MOM Preview',
      subtitle: 'Schedule site visit before sending',
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
                        'Minutes of Meeting',
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
                      'Initial lead discussion completed for ${lead.clientName}. Field Officer captured client, contact, location, source, and priority details. Operational requirements will be collected during the scheduled site visit. Notes: ${lead.remarks}',
                ),
                const MomRow(
                  label: 'Action Items',
                  value:
                      '1. Share Lead MOM with client.\n2. Conduct scheduled site visit.\n3. Capture operational requirements during site assessment.',
                ),
                MomRow(
                  label: 'Next Follow-up Date',
                  value: formatDate(_followUpDate),
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
                        'Site Visit Scheduling',
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
                  'This captures the client-agreed visit date and time before the MOM is sent.',
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
    if (leads.isEmpty) {
      return const SizedBox.shrink();
    }

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
                  'Upcoming Site Visits',
                  style: TextStyle(
                    color: slate950,
                    fontSize: 17,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              StatusBadge(text: 'Scheduled', color: Color(0xFF059669)),
            ],
          ),
          const SizedBox(height: 14),
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

class MetricCard extends StatelessWidget {
  const MetricCard({super.key, required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 76),
      padding: const EdgeInsets.all(10),
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
              fontSize: 20,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              color: Color(0xDDEEF4FF),
              fontSize: 11,
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
          ).textTheme.titleLarge?.copyWith(color: Colors.white, fontSize: 26),
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
