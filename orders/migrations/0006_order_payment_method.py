from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0005_alter_payment_options_alter_payment_table"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="payment_method",
            field=models.CharField(
                choices=[
                    ("UNKNOWN", "Not selected"),
                    ("CARD", "Card"),
                    ("COD", "Cash on Delivery"),
                    ("UPI", "UPI"),
                ],
                default="UNKNOWN",
                max_length=20,
            ),
        ),
    ]
