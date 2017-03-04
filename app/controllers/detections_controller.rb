class DetectionsController < ApplicationController
  # Each time you post, by default Rails expects an authenticity token so this turns it off
  skip_before_action :verify_authenticity_token

  def create
    client = Aws::Rekognition::Client.new

    # Send image to Amazon for detection
    resp = client.detect_labels(
      image: {bytes: Base64.decode64(params[:image])}
    )
    # Maps the labels that were returned to get their names
    labels = resp.labels.map { |label| label.name }
    render json: {labels: labels}
  end
end
