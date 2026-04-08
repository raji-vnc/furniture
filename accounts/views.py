from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.views.decorators.csrf import ensure_csrf_cookie

from accounts.models import Profile
from blog.models import Blog
from orders.models import Order

# Create your views here.

@ensure_csrf_cookie
def signup(request):
    return render(request,'signup.html')

@ensure_csrf_cookie
def signin(request):
    return render(request,'signin.html')

def home(request):
    return render(request,'index.html')

@login_required(login_url='/accounts/signin/')
def profile(request):
    user_profile, _ = Profile.objects.get_or_create(user=request.user)
    orders = (
        Order.objects.filter(user=request.user)
        .prefetch_related("items__product")
        .order_by("-created_at")
    )
    if request.method == "POST":
        title = request.POST.get("blog_title", "").strip()
        content = request.POST.get("blog_content", "").strip()
        image = request.FILES.get("blog_image")

        if title and content:
            Blog.objects.create(
                title=title,
                content=content,
                image=image,
                author=request.user.username,
            )
            messages.success(request, "Blog posted successfully! It now appears on the blog page.")
            return redirect("accounts:profile")
        else:
            messages.error(request, "Please provide both a title and content for your blog post.")

    return render(
        request,
        'profile.html',
        {
            'user_profile': user_profile,
            'orders': orders,
        },
    )
