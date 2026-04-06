from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from cart.models import Cart


class Command(BaseCommand):
    help = "Inspect, merge, and clean up cart records."

    def add_arguments(self, parser):
        parser.add_argument(
            "--list",
            action="store_true",
            help="Show current guest and user carts.",
        )
        parser.add_argument(
            "--username",
            type=str,
            help="Username to receive recovered guest carts.",
        )
        parser.add_argument(
            "--session-key",
            action="append",
            dest="session_keys",
            help="Specific guest session key to merge. Can be repeated.",
        )
        parser.add_argument(
            "--all-guest",
            action="store_true",
            help="Merge all guest carts into the given username.",
        )
        parser.add_argument(
            "--cleanup-empty",
            action="store_true",
            help="Delete carts that have no items.",
        )

    def handle(self, *args, **options):
        if options["list"]:
            self.print_summary()
            return

        if options["cleanup_empty"]:
            deleted = self.cleanup_empty_carts()
            self.stdout.write(self.style.SUCCESS(f"Deleted {deleted} empty cart(s)."))
            return

        username = options.get("username")
        session_keys = options.get("session_keys") or []
        merge_all = options.get("all_guest")

        if not username:
            raise CommandError("Use --username when merging carts.")

        if not session_keys and not merge_all:
            raise CommandError("Use --session-key ... or --all-guest to choose carts to recover.")

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist as exc:
            raise CommandError(f'User "{username}" does not exist.') from exc

        merged_count = self.merge_guest_carts(user, session_keys=session_keys, merge_all=merge_all)
        self.stdout.write(
            self.style.SUCCESS(f"Merged {merged_count} guest cart(s) into user {user.username}.")
        )

    def print_summary(self):
        guest_carts = Cart.objects.filter(user__isnull=True).prefetch_related("items__product")
        user_carts = Cart.objects.filter(user__isnull=False).select_related("user").prefetch_related("items__product")

        self.stdout.write(f"Guest carts: {guest_carts.count()}")
        for cart in guest_carts:
            self.stdout.write(
                f"  id={cart.id} session_key={cart.session_key} items={cart.items.count()}"
            )

        self.stdout.write(f"User carts: {user_carts.count()}")
        for cart in user_carts:
            self.stdout.write(
                f"  id={cart.id} user={cart.user.username} items={cart.items.count()}"
            )

    @transaction.atomic
    def merge_guest_carts(self, user, session_keys, merge_all):
        guest_carts = Cart.objects.filter(user__isnull=True)
        if session_keys:
            guest_carts = guest_carts.filter(session_key__in=session_keys)
        elif merge_all:
            guest_carts = guest_carts.all()

        merged_count = 0
        for cart in guest_carts:
            cart.merge_with_user_cart(user)
            merged_count += 1
        return merged_count

    def cleanup_empty_carts(self):
        empty_carts = [cart.id for cart in Cart.objects.all() if cart.items.count() == 0]
        if not empty_carts:
            return 0
        deleted, _ = Cart.objects.filter(id__in=empty_carts).delete()
        return deleted
