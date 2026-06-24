from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .serializers import ContactSerializer
from contacts.models import Contact


class ContactViewSet(ModelViewSet):
    """Public contact submission plus admin management."""

    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    # Disable session auth so CSRF isn't required for the public POST.
    authentication_classes = []

    
    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAdminUser()]


@api_view(['PUT','DELETE'])
def contact_update_delete(request,pk):
    try:
        contact=Contact.objects.get(id=pk)
    except Contact.DoesNotExist:
        return Response({
            "message":'contact not found'
        },status=404)
    if request.method=='PUT':
        serializer=ContactSerializer(contact,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=400)
    
    if request.method =='DELETE':
        contact.delete()
        return Response({"message":"contact deleted successfully"})
        
