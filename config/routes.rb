Rails.application.routes.draw do
  root to: 'in_front#index'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  get 'detections', to: 'detections#create'
end
