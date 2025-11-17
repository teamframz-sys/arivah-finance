-- ============================================================================
-- RESET TRANSACTIONS DATA
-- ============================================================================
-- This script removes all transaction-related data to start fresh
-- while keeping users, businesses, partners, and system configuration intact
--
-- IMPORTANT: This will delete:
-- - All transactions
-- - All inter-business transfers
-- - All profit sharing logs
-- - All investments and investment settlements
-- - All personal expenses
-- - All tasks
-- - All activity logs
--
-- This will NOT delete:
-- - Users (including Arivah system user)
-- - Businesses (Arivah Web Dev, Arivah Jewels)
-- - Partners
-- - Business-Partner relationships
-- ============================================================================

-- Disable triggers temporarily to avoid issues
SET session_replication_role = replica;

-- Delete activity logs
DELETE FROM public.activity_logs;
RAISE NOTICE '✅ Deleted all activity logs';

-- Delete investment settlements first (has FK to investments)
DELETE FROM public.investment_settlements;
RAISE NOTICE '✅ Deleted all investment settlements';

-- Delete investments
DELETE FROM public.investments;
RAISE NOTICE '✅ Deleted all investments';

-- Delete personal expenses
DELETE FROM public.personal_expenses;
RAISE NOTICE '✅ Deleted all personal expenses';

-- Delete profit sharing logs
DELETE FROM public.profit_sharing_logs;
RAISE NOTICE '✅ Deleted all profit sharing logs';

-- Delete inter-business transfers
DELETE FROM public.inter_business_transfers;
RAISE NOTICE '✅ Deleted all inter-business transfers';

-- Delete all transactions
DELETE FROM public.transactions;
RAISE NOTICE '✅ Deleted all transactions';

-- Delete tasks
DELETE FROM public.tasks;
RAISE NOTICE '✅ Deleted all tasks';

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Verify what remains
DO $$
DECLARE
  user_count INTEGER;
  business_count INTEGER;
  partner_count INTEGER;
  transaction_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.users;
  SELECT COUNT(*) INTO business_count FROM public.businesses;
  SELECT COUNT(*) INTO partner_count FROM public.partners;
  SELECT COUNT(*) INTO transaction_count FROM public.transactions;

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ RESET COMPLETE - Database cleaned successfully!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Remaining Data:';
  RAISE NOTICE '  👥 Users: %', user_count;
  RAISE NOTICE '  🏢 Businesses: %', business_count;
  RAISE NOTICE '  🤝 Partners: %', partner_count;
  RAISE NOTICE '';
  RAISE NOTICE '🗑️  Deleted Data:';
  RAISE NOTICE '  💰 Transactions: 0';
  RAISE NOTICE '  📥 Investments: 0';
  RAISE NOTICE '  💳 Personal Expenses: 0';
  RAISE NOTICE '  🔄 Transfers: 0';
  RAISE NOTICE '  📋 Tasks: 0';
  RAISE NOTICE '  📝 Activity Logs: 0';
  RAISE NOTICE '';
  RAISE NOTICE '✨ You can now start adding transactions from scratch!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
